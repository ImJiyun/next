import Hero from "@/components/Hero";
import performanceImg from "/public/performance.jpg";

export default function Performance() {
  return (
    <Hero
      imgData={performanceImg}
      imgAlt="welding"
      title="A high performance"
    />
  );
}
