import { About } from '@/modules/about';
import { Faq } from '@/modules/faq';
import { Hero, HeroTicker } from '@/modules/hero';
import { RootLayout } from '@/modules/layout';
import { NominationsSection } from '@/modules/nominations';
import { Commission } from '@/modules/commission';
import { Tickets } from '@/modules/tickets';
import { VotingStages } from '@/modules/voting-stages';

export function LandingPage() {
  return (
    <RootLayout>
      <Hero />
      <HeroTicker />
      <About />
      <NominationsSection />
      <VotingStages />
      <Tickets />
      <Faq />
      <Commission />
    </RootLayout>
  );
}
