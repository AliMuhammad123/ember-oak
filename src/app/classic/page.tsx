import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Menu } from "@/components/Menu";
import { Navbar } from "@/components/Navbar";
import { Reservation } from "@/components/Reservation";
import { Story } from "@/components/Story";
import { Testimonials } from "@/components/Testimonials";

export default function Classic() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Menu />
        <Story />
        <Gallery />
        <Testimonials />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
