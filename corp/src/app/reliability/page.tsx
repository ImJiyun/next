import Hero from "@/components/Hero";
import reliabilityImg from "/public/reliability.jpg";

export default function Reliability() {
  return (
    <Hero
      imgData={reliabilityImg}
      imgAlt="welding"
      title="Super high reliability hosting"
    />
  );
}
