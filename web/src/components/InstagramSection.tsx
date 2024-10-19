export default function InstagramSection({
  settings,
}: {
  settings: { beholdFeedUrl: string };
}) {
  return (
    <section className="w-full text-left  bg-light" id="gallery">
      <div className="max-w-5xl mx-6 md:mx-16 lg:mx-auto">
        <h1 className="mb-10 md:mb-20">Instagram</h1>
        <ul
          className="grid px-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-4"
          x-data="{ posts: [] }"
          x-init={`posts = await (await fetch('https://feed.ourmovingstories.com')).json()`}
        >
          <template x-for="(post, index) in posts">
            <li className="list-none">
              <a x-bind:href="post.permalink" className="frame" target="_blank">
                <template x-if="post.mediaType === 'IMAGE'">
                  <img
                    x-bind:src="post.mediaUrl"
                    x-bind:alt="post.prunedCaption"
                    width=""
                  />
                </template>

                <template x-if="post.mediaType === 'CAROUSEL_ALBUM'">
                  <img
                    x-bind:src="post.mediaUrl"
                    x-bind:alt="post.prunedCaption"
                  />
                </template>

                <template x-if="post.mediaType === 'VIDEO'">
                  <img
                    x-bind:src="post.thumbnailUrl"
                    x-bind:alt="post.prunedCaption"
                  />
                </template>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </section>
  );
}
