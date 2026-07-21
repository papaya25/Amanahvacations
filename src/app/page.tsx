import Hero from "@/components/Hero";
import TripPicker from "@/components/TripPicker";
import Activities from "@/components/Activities";
import HowItWorks from "@/components/HowItWorks";
import DreamAdventure from "@/components/DreamAdventure";

export default function Home() {
  return (
    <main>
      <Hero />
      <TripPicker />
      <Activities />
      <HowItWorks />
      <DreamAdventure />
    </main>
  );
}
