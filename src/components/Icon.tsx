import {
  ClipboardCheck, Cpu, Dna, Droplets, FileCheck2, FlaskConical, GraduationCap, Map, Repeat, Search, ShieldCheck, Sprout, Store, Timer,
  Upload, Workflow, Zap, ZoomIn, type LucideProps,
} from 'lucide-react';

const icons = {
  ClipboardCheck, Cpu, Dna, Droplets, FileCheck2, FlaskConical, GraduationCap, Map, Repeat, Search, ShieldCheck, Sprout, Store, Timer,
  Upload, Workflow, Zap, ZoomIn,
};

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = icons[name];
  return <C {...props} />;
}
