import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Film } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatInputProps {
    onSendMessage: (message: string, files: File[]) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    isLoading,
}) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((message.trim() || selectedFiles.length > 0) && !isLoading) {
            onSendMessage(message, selectedFiles);
            setMessage('');
            setSelectedFiles([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Append new files to existing ones
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 pb-4">
            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto py-2">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg border border-gray-700 bg-space-800 flex items-center justify-center overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Film className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative flex items-end gap-2 text-white">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className={cn(
                        'p-3 rounded-lg border border-gray-700 bg-space-700/50',
                        'text-gray-400 hover:text-white hover:bg-space-600',
                        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter query for Mission Control AI..."
                        disabled={isLoading}
                        className={cn(
                            'w-full px-4 py-3 pr-12 rounded-lg',
                            'bg-space-700/50 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                            'transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />

                    <button
                        type="submit"
                        disabled={(!message.trim() && selectedFiles.length === 0) || isLoading}
                        className={cn(
                            'absolute right-2 top-1/2 -translate-y-1/2',
                            'p-2 rounded-lg transition-all',
                            'bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan',
                            'hover:bg-accent-cyan/30 hover:shadow-glow-sm-cyan',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </form>
    );
};
