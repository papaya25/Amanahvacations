import Hero from "@/components/Hero";
import PostcardDivider from "@/components/PostcardDivider";
import TripPicker from "@/components/TripPicker";
import Activities from "@/components/Activities";
import HowItWorks from "@/components/HowItWorks";
import DreamAdventure from "@/components/DreamAdventure";

export default function Home() {
  return (
    <main>
      <Hero />
      <PostcardDivider />
      <TripPicker />
      <Activities />
      <HowItWorks />
      <DreamAdventure />
    </main>
  );
}
