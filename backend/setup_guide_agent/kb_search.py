"""KB semantic search — FAISS + Google Embeddings.

Builds an in-memory FAISS index over the knowledge base markdown files,
using gemini-embedding-001 for vector representations. Caches embeddings
to disk so only changed files are re-embedded on restart.
"""

import os
import time
import hashlib
import json
import asyncio
import logging
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

_CONTEXT_DIR = Path(__file__).parent / "context"
_EMBEDDING_MODEL = "models/gemini-embedding-001"
_EMBEDDING_DIM = 768
_CACHE_PATH = Path(os.getenv("KB_EMBEDDING_CACHE", "/tmp/easyclaw_kb_embeddings.npz"))
_HASH_PATH = _CACHE_PATH.with_suffix(".hashes.json")
_BATCH_SIZE = 50


class KBIndex:
    """In-memory FAISS index over the knowledge base markdown files."""

    def __init__(self):
        self._index = None
        self._paths: list[str] = []
        self._built = False

    async def build(self, force: bool = False) -> None:
        """Build or rebuild the FAISS index.

        Uses cached embeddings for unchanged files. Only re-embeds files
        whose content hash has changed since the last build.
        """
        if self._built and not force:
            return
        import faiss

        md_files = sorted(_CONTEXT_DIR.rglob("*.md"))
        current_hashes, contents = {}, {}
        for f in md_files:
            rel = str(f.relative_to(_CONTEXT_DIR))
            text = f.read_text(errors="replace")
            current_hashes[rel] = hashlib.md5(text.encode()).hexdigest()
            contents[rel] = text

        # Load cache — only re-embed changed files
        cached = {}
        if not force and _CACHE_PATH.exists() and _HASH_PATH.exists():
            try:
                saved_hashes = json.loads(_HASH_PATH.read_text())
                data = np.load(_CACHE_PATH)
                for i, p in enumerate(data["paths"]):
                    if p in current_hashes and saved_hashes.get(p) == current_hashes[p]:
                        cached[p] = data["vectors"][i]
            except Exception:
                cached = {}

        to_embed = {r: t for r, t in contents.items() if r not in cached}
        if to_embed and not os.environ.get("GEMINI_API_KEY"):
            logger.warning("[KB] No GEMINI_API_KEY — skipping embedding, keyword search only")
            self._built = False
            raise RuntimeError("No GEMINI_API_KEY for embeddings")
        fresh = await self._embed_batch(to_embed) if to_embed else {}

        all_paths = sorted(contents.keys())
        vectors = [
            cached.get(r, fresh.get(r, np.zeros(_EMBEDDING_DIM, dtype=np.float32)))
            for r in all_paths
        ]
        matrix = np.array(vectors, dtype=np.float32)
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1
        matrix /= norms

        index = faiss.IndexFlatIP(_EMBEDDING_DIM)
        index.add(matrix)
        self._index, self._paths, self._built = index, all_paths, True

        # Cache for next startup
        np.savez(
            _CACHE_PATH,
            paths=np.array(all_paths),
            vectors=np.array(vectors, dtype=np.float32),
        )
        _HASH_PATH.write_text(json.dumps(current_hashes))
        logger.info(f"[KB] Index: {len(all_paths)} files, {len(to_embed)} embedded")

    async def search(self, query: str, top_k: int = 15) -> list[dict]:
        """Search the index for documents most relevant to the query.

        Returns list of {"path": str, "score": float} sorted by relevance.
        Falls back to keyword search if FAISS index is unavailable.
        """
        if not self._built:
            try:
                await self.build()
            except Exception as e:
                logger.warning(f"[KB] Index build failed, using keyword fallback: {e}")
                return await self._keyword_search(query, top_k)
        qvec = await self._embed_single(query)
        if qvec is None:
            logger.warning("[KB] Embedding failed, using keyword fallback")
            return await self._keyword_search(query, top_k)
        qvec = (qvec / np.linalg.norm(qvec)).reshape(1, -1).astype(np.float32)
        scores, indices = self._index.search(qvec, min(top_k, len(self._paths)))
        return [
            {"path": self._paths[i], "score": float(s)}
            for s, i in zip(scores[0], indices[0])
            if i >= 0
        ]

    async def _keyword_search(self, query: str, top_k: int = 15) -> list[dict]:
        """Simple keyword fallback when Gemini embeddings are unavailable."""
        keywords = [w.lower() for w in query.split() if len(w) > 2]
        if not keywords:
            return []

        md_files = sorted(_CONTEXT_DIR.rglob("*.md"))
        scored = []
        for f in md_files:
            try:
                text = f.read_text(errors="ignore").lower()
                hits = sum(text.count(kw) for kw in keywords)
                name_hits = sum(3 for kw in keywords if kw in f.name.lower())
                score = hits + name_hits
                if score > 0:
                    rel = str(f.relative_to(_CONTEXT_DIR))
                    scored.append({"path": rel, "score": float(score)})
            except Exception:
                continue

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    async def _embed_single(self, text: str):
        """Embed a single query text using Gemini embeddings."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
        try:
            r = await asyncio.to_thread(
                client.models.embed_content,
                model=_EMBEDDING_MODEL,
                contents=text[:8000],
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_QUERY",
                    output_dimensionality=768,
                ),
            )
            return np.array(r.embeddings[0].values, dtype=np.float32)
        except Exception as e:
            logger.error(f"[KB] Embed failed: {e}")
            return None

    async def _embed_batch(self, files: dict[str, str]) -> dict[str, np.ndarray]:
        """Embed a batch of documents using Gemini embeddings."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
        results = {}
        items = list(files.items())
        for i in range(0, len(items), _BATCH_SIZE):
            batch = items[i : i + _BATCH_SIZE]
            texts = [t[:8000] for _, t in batch]
            try:
                r = await asyncio.to_thread(
                    client.models.embed_content,
                    model=_EMBEDDING_MODEL,
                    contents=texts,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                        output_dimensionality=768,
                    ),
                )
                for j, (rel, _) in enumerate(batch):
                    results[rel] = np.array(r.embeddings[j].values, dtype=np.float32)
            except Exception as e:
                logger.error(f"[KB] Batch embed failed: {e}")
        return results


kb_index = KBIndex()  # module singleton
