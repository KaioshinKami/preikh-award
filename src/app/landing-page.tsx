import { About } from '@/modules/about';
import { Commission } from '@/modules/commission';
import { Faq } from '@/modules/faq';
import { Hero, HeroTicker } from '@/modules/hero';
import { NominationsSection } from '@/modules/nominations';
import { Tickets } from '@/modules/tickets';
import { VotingStages } from '@/modules/voting-stages';

export function LandingPage() {
  return (
    <>
      <Hero />
      <HeroTicker />
      <About />
      <NominationsSection />
      <VotingStages />
      <Tickets />
      <Faq />
      <Commission />
    </>
  );
}
