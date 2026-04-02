'use client';

import { useState, useEffect } from 'react';
import { getCreatorPosts } from '@/lib/actions/posts';
import { Clock, Heart } from 'lucide-react';

export default function ActivityFeed({ limit = 5 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const result = await getCreatorPosts();
      if (result.success && result.data?.data) {
        setPosts(result.data.data.slice(0, limit));
      }
      setLoading(false);
    };
    fetchActivity();
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[#CFDBE54D] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#5A5A5A]">No recent activity</p>
        <p className="text-sm text-[#5A5A5A] mt-1">Create your first post to get started!</p>
      </div>
    );
  }

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[#142A38]">Recent Activity</h3>
      {posts.map((post) => (
        <div key={post.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#435a6742]">
          <div className="p-2 bg-[#CFDBE54D] rounded-full">
            <Clock className="size-4 text-[#435a67]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#142A38] truncate">
              Post: &ldquo;{post.caption || 'Untitled'}&rdquo;
            </p>
            <p className="text-xs text-[#5A5A5A] mt-1">
              {formatTimeAgo(post.created_at)} • {post.likes_count || 0} <Heart className="size-3 inline" />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
