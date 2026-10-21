import { Dna, Droplets, FileCheck2, FlaskConical, GraduationCap, ShieldCheck, Sprout, Workflow, type LucideProps } from 'lucide-react';

const icons = { Dna, Droplets, FileCheck2, FlaskConical, GraduationCap, ShieldCheck, Sprout, Workflow };

export function Icon({ name, ...props }: { name: keyof typeof icons } & LucideProps) {
  const C = icons[name];
  return <C {...props} />;
}
