export default function InstagramSection({
  settings,
}: {
  settings: { beholdFeedUrl: string };
}) {
  return (
    <section class="w-full text-left pt-24 bg-light" id="gallery">
      <div class="max-w-5xl mx-auto">
        <h1 class="mb-20">Instagram</h1>
        <ul
          className="grid px-8 lg:px-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-4"
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
