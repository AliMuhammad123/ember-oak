import { ExperienceBand } from "@/components/ExperienceBand";
import { Features } from "@/components/Features";
import { FireScene } from "@/components/FireScene";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Hero3D } from "@/components/Hero3D";
import { Marquee } from "@/components/Marquee";
import { MenuBook } from "@/components/MenuBook";
import { Navbar } from "@/components/Navbar";
import { Reservation } from "@/components/Reservation";
import { Showcase } from "@/components/Showcase";
import { Story } from "@/components/Story";
import { Testimonials } from "@/components/Testimonials";
import { CartDrawer } from "@/components/order/CartDrawer";
import { DishModal } from "@/components/order/DishModal";
import { CartNavButton, FloatingCart, ScrollProgress, Toast } from "@/components/order/OrderChrome";
import { OrderProvider } from "@/components/order/OrderProvider";
import { Cursor } from "@/components/fx/Cursor";
import { Intro } from "@/components/fx/Intro";
import { SmoothScroll } from "@/components/fx/SmoothScroll";

export default function Home() {
  return (
    <OrderProvider>
      <SmoothScroll />
      <Intro />
      <ScrollProgress />
      <Navbar actions={<CartNavButton />} />
      <main id="main">
        <Hero3D />
        <FireScene />
        <Marquee />
        <Features />
        <Showcase />
        <MenuBook />
        <Story />
        <ExperienceBand />
        <Gallery />
        <Testimonials />
        <Reservation />
      </main>
      <Footer />
      <DishModal />
      <CartDrawer />
      <FloatingCart />
      <Toast />
      <Cursor />
      <div aria-hidden className="grain" />
    </OrderProvider>
  );
}
