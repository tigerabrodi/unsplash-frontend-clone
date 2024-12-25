import { useParams } from 'react-router'
import { useGetUser } from './useGetUser'
import { MapPinIcon } from 'lucide-react'
import { SearchParams } from '@/lib/schemas'
import { useGetUserPhotos } from './useGetUserPhotos'
import { ImageGrid } from '@/components/photos/ImageGrid'
import { ImageGridSkeleton } from '@/components/photos/ImageGridSkeleton'

// The reason for hardcoding and not doing what we did in the home page:
// ...Unsplash API doesn't return results as paginated results for `/users/:username/photos` endpoint
// Rather, they simply return an array of photos
// However, we can decide how many photos we want to load
// I KNOW so annoying, like why let me provide a page number if I can't paginate?!
const HARD_CODED_PAGE_INDEX = 1
const USER_PHOTOS_PER_PAGE = 50

export function UserDetailPage() {
  const { username } = useParams()
  return (
    <main className="container mx-auto flex w-full flex-col gap-6 px-4 md:px-0">
      <UserHeader username={username} />
      <UserPhotos username={username} />
    </main>
  )
}

function UserHeaderSkeleton() {
  return (
    <div className="relative flex flex-col items-center gap-4 border-b pb-4">
      <div className="size-24 animate-pulse rounded-full bg-muted" />

      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />{' '}
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />{' '}
        </div>

        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      <div className="absolute left-4 top-2 flex h-8 w-32 animate-pulse items-center gap-1 rounded-full bg-muted" />
    </div>
  )
}

function UserHeader({ username }: { username: string | undefined }) {
  const {
    isError: isUserError,
    isLoading: isUserLoading,
    data: user,
  } = useGetUser(username)

  if (isUserLoading || !user) return <UserHeaderSkeleton />
  if (isUserError) return <div>Error</div>

  return (
    <div className="relative flex flex-col items-center gap-4 border-b pb-4">
      <img
        className="size-24 rounded-full"
        srcSet={`
              ${user.profile_image.small} 1x,
              ${user.profile_image.medium} 2x,
              ${user.profile_image.large} 3x
            `}
        src={user.profile_image.small}
        alt=""
      />

      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-primary">{user.name}</h1>
          <p className="text-sm italic text-muted-foreground">
            @{user.username}
          </p>
        </div>

        {user.bio && (
          <p className="max-w-[600px] text-muted-foreground">{user.bio}</p>
        )}
      </div>

      {user.location && (
        <div className="absolute left-0 top-2 hidden items-center gap-1 rounded-lg bg-muted p-2 text-muted-foreground md:flex">
          <MapPinIcon size={16} />
          <p className="text-sm font-normal capitalize">
            {user.location.split(',').join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

function UserPhotos({ username }: { username: string | undefined }) {
  const currentParams: Pick<SearchParams, 'page' | 'perPage'> = {
    page: HARD_CODED_PAGE_INDEX,
    perPage: USER_PHOTOS_PER_PAGE,
  }

  const {
    data: photos,
    isLoading: isPhotosLoading,
    isError: isPhotosError,
  } = useGetUserPhotos({
    username,
    queryParams: currentParams,
  })

  if (isPhotosError) return <div>Error</div>

  if (isPhotosLoading || !photos)
    return <ImageGridSkeleton count={USER_PHOTOS_PER_PAGE} />

  return <ImageGrid images={photos} />
}