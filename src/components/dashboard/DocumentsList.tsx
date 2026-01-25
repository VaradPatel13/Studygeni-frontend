'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { documentService } from '@/services/documentService';
import { ChevronRight, FileText, Search, Upload, Filter, Clock, CheckCircle, AlertCircle, ArrowUpDown, Calendar, X, Edit2, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentsListProps {
    onSelectDocument?: (id: string) => void;
}

export default function DocumentsList({ onSelectDocument }: DocumentsListProps) {
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, pdf, word, ppt
    const [statusFilter, setStatusFilter] = useState('all'); // all, completed, processing
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [sortOption, setSortOption] = useState('date-desc'); // date-desc, date-asc, name-asc, name-desc, size-desc

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 15000)
            );

            const docs = await Promise.race([
                documentService.getAllDocuments(),
                timeoutPromise
            ]) as any[];

            setDocuments(Array.isArray(docs) ? docs : []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        try {
            toast.loading('UPLOADING...');
            await documentService.uploadDocument(formData);
            toast.dismiss();
            toast.success('DOCUMENT UPLOADED_');
            fetchDocuments();
        } catch (error: any) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || 'UPLOAD FAILED');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                toast.loading('DELETING...');
                await documentService.deleteDocument(id);
                toast.dismiss();
                toast.success('DOCUMENT DELETED');
                fetchDocuments();
            } catch (error) {
                toast.dismiss();
                toast.error('DELETE FAILED');
            }
        }
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toast('Edit feature coming soon!', { icon: '✏️' });
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        return <FileText className="w-8 h-8 text-blue-600" />;
    };

    // Advanced Filter & Sort Logic
    const filteredAndSortedDocuments = documents
        .filter(doc => {
            // Text Search
            const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.subject && doc.subject.toLowerCase().includes(searchQuery.toLowerCase()));

            // File Type Filter
            const matchesType = filterType === 'all' ||
                (filterType === 'pdf' && doc.fileType?.includes('pdf')) ||
                (filterType === 'word' && (doc.fileType?.includes('word') || doc.fileType?.includes('doc'))) ||
                (filterType === 'ppt' && (doc.fileType?.includes('presentation') || doc.fileType?.includes('ppt')));

            // Status Filter
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && doc.status === 'completed') ||
                (statusFilter === 'processing' && doc.status !== 'completed');

            // Date Range Filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const docDate = new Date(doc.uploadDate || doc.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - docDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (dateFilter === 'today') matchesDate = diffDays <= 1;
                else if (dateFilter === 'week') matchesDate = diffDays <= 7;
                else if (dateFilter === 'month') matchesDate = diffDays <= 30;
            }

            return matchesSearch && matchesType && matchesStatus && matchesDate;
        })
        .sort((a, b) => {
            const dateA = new Date(a.uploadDate || a.createdAt).getTime();
            const dateB = new Date(b.uploadDate || b.createdAt).getTime();

            switch (sortOption) {
                case 'date-desc': return dateB - dateA;
                case 'date-asc': return dateA - dateB;
                case 'name-asc': return a.title.localeCompare(b.title);
                case 'name-desc': return b.title.localeCompare(a.title);
                case 'size-desc': return (b.filesize || 0) - (a.filesize || 0);
                default: return 0;
            }
        });

    return (
        <div className="flex-1 bg-[#fdfbf7] p-8 overflow-y-auto h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-4xl font-black">Documents</h1>

                    <label className="brutal-btn bg-black text-white hover:bg-gray-800 flex items-center gap-2 cursor-pointer px-6 py-3">
                        <Upload className="w-5 h-5" />
                        <span className="font-bold">Upload New</span>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Primary Search & Filter Toggle */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 font-medium focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`px-4 py-3 border-2 font-bold flex items-center gap-2 transition-colors ${isFiltersOpen ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:border-black'}`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {isFiltersOpen && (
                    <div className="bg-white border-2 border-black p-6 mb-8 grid md:grid-cols-4 gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-2 duration-200">
                        {/* Type Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">File Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full p-2 border-2 border-gray-300 font-medium focus:border-black focus:outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF Documents</option>
                                <option value="word">Word Documents</option>
                                <option value="ppt">Presentations</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-2 border-2 border-gray-300 font-medium focus:border-black focus:outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Processed</option>
                                <option value="processing">Processing</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Date Uploaded</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full p-2 border-2 border-gray-300 font-medium focus:border-black focus:outline-none"
                            >
                                <option value="all">Anytime</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>

                        {/* Sort Option */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Sort By</label>
                            <div className="flex gap-2">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full p-2 border-2 border-gray-300 font-medium focus:border-black focus:outline-none"
                                >
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="size-desc">Largest Size</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-500">
                        Showing {filteredAndSortedDocuments.length} results
                    </p>
                    {(filterType !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
                        <button
                            onClick={() => {
                                setFilterType('all');
                                setStatusFilter('all');
                                setDateFilter('all');
                                setSearchQuery('');
                                setSortOption('date-desc');
                            }}
                            className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear Filters
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="brutal-card bg-gray-100 animate-pulse h-64"></div>
                        ))}
                    </div>
                ) : filteredAndSortedDocuments.length === 0 ? (
                    <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold mb-2">No documents found</p>
                                <p className="text-gray-500">Try adjusting your search or filters.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setFilterType('all');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                    setSearchQuery('');
                                }}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredAndSortedDocuments.map((doc) => (
                            <button
                                key={doc._id}
                                onClick={() => onSelectDocument ? onSelectDocument(doc._id) : router.push(`/dashboard/document/${doc._id}`)}
                                className="brutal-card hover:bg-yellow-50 transition-all group flex flex-col h-full text-left relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(doc.fileUrl || doc.filepath, '_blank');
                                        }}
                                        className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm"
                                        title="Open in New Tab"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                    <div
                                        onClick={(e) => handleEdit(e, doc._id)}
                                        className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </div>
                                    <div
                                        onClick={(e) => handleDelete(e, doc._id)}
                                        className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-blue-100 border-2 border-black flex items-center justify-center mb-4">
                                        {getFileIcon(doc.fileType)}
                                    </div>
                                    <h3 className="font-bold text-xl mb-2 line-clamp-2 leading-tight">{doc.title}</h3>
                                    <p className="text-sm text-gray-500 break-all line-clamp-1">{doc.filename}</p>
                                </div>

                                <div className="mt-auto space-y-3 pt-4 border-t-2 border-gray-100 group-hover:border-black/10 transition-colors">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(doc.uploadDate || doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="font-mono text-xs text-gray-400">
                                            {formatBytes(doc.filesize || 0)}
                                        </span>
                                    </div>

                                    {doc.status && (
                                        <div className="flex items-center gap-2">
                                            {doc.status === 'completed' ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                                                    <CheckCircle className="w-3 h-3" /> PROCESSED
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                                                    <AlertCircle className="w-3 h-3" /> PROCESSING
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
