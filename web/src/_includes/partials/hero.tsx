import h from "vhtml";

export type Props = {
  _type: "hero";
  _key: string;
  title: string;
  subtitle?: string;
  backgroundImage?: {
    asset: {
      url: string;
    };
  };
  cta?: {
    title: string;
    link: string;
  };
};

export default function Hero({ title, cta }: Props) {
  return (
    <section className="w-full max-w-5xl mx-auto text-center pb-24 relative">
      <img
        src="/static/img/yellow.svg"
        className="absolute z-0 -left-48"
        alt=""
      />
      <img
        src="/static/img/teal.svg"
        className="absolute top-[-300px] -right-48 z-0"
        alt=""
      />
      <div className="z-10 relative">
        <div className="box-content m-auto px-4 lg:px-0 max-w-lg text-[38px] font-bold leading-[150%] text-center my-24">
          {title}
        </div>

        {cta && (
          <a
            href={cta.link}
            className="inline-block focus:outline-none bg-text uppercase font-medium text-light text-sm py-2 px-4 hover:cursor-pointer tracking-widest"
            aria-label="subscribe"
          >
            {cta.title}
          </a>
        )}
      </div>
    </section>
  );
}
