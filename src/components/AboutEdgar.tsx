import { BookingLink } from "@/components/BookingLink";
import { EDGAR, SHOP } from "@/content/site";

export function AboutEdgar() {
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-20">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-center sm:gap-12">
        <figure className="mx-auto w-full max-w-[17rem] sm:max-w-sm">
          <video
            controls
            playsInline
            preload="none"
            poster={EDGAR.video.poster}
            width={720}
            height={1280}
            className="aspect-[9/16] w-full rounded-2xl bg-ink object-cover shadow-md"
          >
            <source src={EDGAR.video.src} type="video/mp4" />
            Your browser can&apos;t play this video.
          </video>
          <figcaption className="mt-2 text-center text-sm text-ink-muted">{EDGAR.video.caption}</figcaption>
        </figure>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">The barber</p>
          <h2 id="about-heading" className="mt-1 font-display text-4xl font-bold uppercase">
            About Edgar
          </h2>
          <div className="mt-4 space-y-3 text-lg leading-relaxed">
            {EDGAR.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-wood/20 bg-white p-5">
            <h3 className="font-display text-xl font-bold uppercase">{SHOP.name}</h3>
            <p className="text-ink-muted">{SHOP.address ?? SHOP.city}</p>
            {SHOP.hours.length > 0 ? (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {SHOP.hours.map(({ days, hours }) => (
                  <div key={days} className="contents">
                    <dt className="font-semibold">{days}</dt>
                    <dd>{hours}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">See available times on Edgar&apos;s booking page.</p>
            )}
            <BookingLink className="mt-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
