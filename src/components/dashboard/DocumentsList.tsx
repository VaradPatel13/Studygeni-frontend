'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { documentService } from '@/services/documentService';
import { ChevronRight, FileText, Search, Upload, Filter, Clock, CheckCircle, AlertCircle, ArrowUpDown, Calendar, X, Edit2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';

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

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            toast.loading('DELETING...');
            await documentService.deleteDocument(deleteId);
            toast.dismiss();
            toast.success('DOCUMENT DELETED');
            fetchDocuments();
        } catch (error) {
            toast.dismiss();
            toast.error('DELETE FAILED');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
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
        <div className="flex-1 bg-[var(--bg-page)] p-8 overflow-y-auto h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-medium app-title text-[var(--text-primary)]">Documents</h1>

                    <label className="btn-app btn-primary h-11 px-6 rounded-full shadow-md cursor-pointer gap-2">
                        <Upload className="w-5 h-5" />
                        <span>Upload New</span>
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
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 rounded-xl bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] border-none focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all placeholder-[var(--text-tertiary)]"
                        />
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`px-6 h-12 rounded-xl border flex items-center gap-2 transition-all font-medium ${isFiltersOpen
                            ? 'bg-[var(--bg-surface-highlight)] border-[var(--border-focus)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)]'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {isFiltersOpen && (
                    <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-8 grid md:grid-cols-4 gap-6 shadow-sm animate-in slide-in-from-top-2 duration-200">
                        {/* Type Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 block tracking-wider">File Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/10 outline-none transition-all"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF Documents</option>
                                <option value="word">Word Documents</option>
                                <option value="ppt">Presentations</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 block tracking-wider">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/10 outline-none transition-all"
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Processed</option>
                                <option value="processing">Processing</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 block tracking-wider">Date Uploaded</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/10 outline-none transition-all"
                            >
                                <option value="all">Anytime</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>

                        {/* Sort Option */}
                        <div>
                            <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 block tracking-wider">Sort By</label>
                            <div className="flex gap-2">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/10 outline-none transition-all"
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
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
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
                            className="text-sm text-[var(--color-brand-red)] font-medium hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear Filters
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="app-card h-64 p-8 flex flex-col relative">
                                <div className="mb-6 pt-2">
                                    <Skeleton className="w-14 h-14 rounded-2xl mb-5" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="mt-auto space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-12 rounded-full" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedDocuments.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--bg-page)] border border-dashed border-[var(--border-subtle)] rounded-3xl">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-[var(--bg-surface-highlight)] rounded-full flex items-center justify-center">
                                <Filter className="w-8 h-8 text-[var(--text-tertiary)]" />
                            </div>
                            <div>
                                <p className="text-xl font-medium text-[var(--text-primary)] mb-2">No documents found</p>
                                <p className="text-[var(--text-secondary)]">Try adjusting your search or filters.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setFilterType('all');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                    setSearchQuery('');
                                }}
                                className="text-[var(--color-brand-blue)] font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                        {filteredAndSortedDocuments.map((doc) => (
                            <button
                                key={doc._id}
                                onClick={() => onSelectDocument ? onSelectDocument(doc._id) : router.push(`/dashboard/document/${doc._id}`)}
                                className="app-card text-left relative overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-64 p-0 bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)]"
                            >
                                {/* Header / Preview Area */}
                                <div className="h-1/2 w-full bg-[var(--bg-surface-highlight)]/50 p-6 flex flex-col justify-between relative overflow-hidden group-hover:bg-[var(--color-brand-blue)]/5 transition-colors">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 translate-y-0 md:translate-y-1 md:group-hover:translate-y-0">
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(doc.fileUrl || doc.filepath, '_blank');
                                            }}
                                            className="p-2 bg-[var(--bg-page)] rounded-full hover:bg-[var(--bg-surface-highlight)] transition-colors shadow-sm cursor-pointer border border-[var(--border-subtle)]"
                                            title="Open Original"
                                        >
                                            <ExternalLink className="w-4 h-4 text-[var(--text-secondary)]" />
                                        </div>
                                        <div
                                            onClick={(e) => handleDelete(e, doc._id)}
                                            className="p-2 bg-[var(--bg-page)] rounded-full hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm cursor-pointer border border-[var(--border-subtle)]"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-[var(--color-brand-red)]" />
                                        </div>
                                    </div>

                                    <div className="w-12 h-12 bg-[var(--bg-page)] rounded-xl flex items-center justify-center shadow-sm border border-[var(--border-subtle)] group-hover:scale-105 transition-transform duration-300">
                                        <FileText className="w-6 h-6 text-[var(--color-brand-blue)]" />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-base text-[var(--text-primary)] mb-1.5 line-clamp-1 leading-snug group-hover:text-[var(--color-brand-blue)] transition-colors" title={doc.title}>
                                            {doc.title}
                                        </h3>
                                        <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 break-all">{doc.filename}</p>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-2">
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                            <span>{new Date(doc.uploadDate || doc.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        {doc.status === 'completed' ? (
                                            <div className="flex items-center gap-1.5 text-[10px] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" />
                                                Processed
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] bg-[var(--color-brand-yellow)]/10 text-[#f29900] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                <AlertCircle className="w-3 h-3" />
                                                Processing
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Dialog */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[var(--bg-page)] rounded-2xl shadow-xl max-w-sm w-full p-6 border border-[var(--border-subtle)] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Document?</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                                Are you sure you want to delete this document? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(null); }}
                                    className="flex-1 px-4 py-2 rounded-full border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 rounded-full bg-[var(--color-brand-red)] text-white font-medium hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
