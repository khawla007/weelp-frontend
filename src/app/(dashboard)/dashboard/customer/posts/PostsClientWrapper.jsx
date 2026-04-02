'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit2, Trash2, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deletePost } from '@/lib/actions/posts';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';

export default function PostsClientWrapper({ initialPosts, lastPage }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMore = async () => {
    if (page >= lastPage || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/creator/posts?page=${page + 1}`);
      const data = await res.json();
      if (data.data) {
        setPosts((prev) => [...prev, ...data.data]);
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeletingId(id);
    const result = await deletePost(id);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditModalOpen(false);
    setEditingPost(null);
    router.refresh();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#142A38]">No posts yet</p>
        <p className="text-[#5A5A5A] mt-2">Create your first post to share your travel experiences!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-[#435a6742] overflow-hidden">
            {post.media_url && (
              <div className="aspect-video bg-[#CFDBE54D] relative">
                <img
                  src={post.media_url}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-[#142A38] line-clamp-2 mb-3">{post.caption || 'No caption'}</p>
              <div className="flex items-center justify-between text-xs text-[#5A5A5A] mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="size-3" />
                    {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3" />
                    {post.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="size-3" />
                    {post.shares_count || 0}
                  </span>
                </div>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {post.tagged_items?.slice(0, 2).map((item, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#CFDBE54D] rounded-full text-[#435a67]">
                      {item.name}
                    </span>
                  ))}
                  {post.tagged_items?.length > 2 && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#CFDBE54D] rounded-full text-[#435a67]">
                      +{post.tagged_items.length - 2}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(post)}>
                      <Edit2 className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="size-4 mr-2" />
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {page < lastPage && (
        <div className="mt-8 text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="border-[#435a6742] text-[#435a67] hover:bg-[#CFDBE54D]"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {editingPost && (
        <CreatePostModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onPostCreated={handlePostUpdated}
          initialData={editingPost}
        />
      )}
    </>
  );
}
