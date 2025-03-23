import Hero from "@/components/Hero";
import scaleImg from "/public/scale.jpg";

export default function Scale() {
  return (
    <Hero
      imgData={scaleImg}
      imgAlt="steel factory"
      title="Scale your app to infinity"
    />
  );
}
