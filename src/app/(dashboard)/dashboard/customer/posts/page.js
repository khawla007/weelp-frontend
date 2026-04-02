import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getCreatorPosts } from '@/lib/actions/posts';
import PostsClientWrapper from './PostsClientWrapper';

export const metadata = {
  title: 'My Posts - Weelp',
  description: 'Manage and organize your travel posts',
};

export default async function MyPostsPage() {
  const session = await auth();

  if (!session?.user?.is_creator) {
    redirect('/dashboard/customer');
  }

  const result = await getCreatorPosts();
  const posts = result.success ? result.data?.data || [] : [];
  const lastPage = result.success ? result.data?.last_page || 1 : 1;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">My Posts</h1>
          <p className="text-[#5A5A5A] mt-1">Manage and organize your travel posts.</p>
        </div>
      </div>

      <PostsClientWrapper initialPosts={posts} lastPage={lastPage} />
    </div>
  );
}
