export enum University {
  UNSW = "University of New South Wales",
  MACQ = "Macquarie University",
  USYD = "University of Sydney",
  UTS = "University of Technology, Sydney",
  ACU = "Australian Catholic University",
  WSU = "Western Sydney University",
  SOW = "SOW",
}

export const universityColours: Record<string, string> = {
  [University.USYD]: "#B5403D",
  [University.UNSW]: "#619445",
  [University.UTS]: "#3B5499",
  [University.MACQ]: "#F2C259",
  [University.ACU]: "#57427A",
  [University.WSU]: "#990033",
};

export function getUniversityKey(value?: string): string | undefined {
  return Object.keys(University).find(
    (key) => University[key as keyof typeof University] === value
  );
}

export const universityIds: Record<string, string> = {
  [University.UNSW]: "ccSgQTXvLRnin0OjwvRM",
  [University.MACQ]: "CZHRnKJ8SDnfMIw64WJu",
  [University.USYD]: "MUSmSaufEfgdJUX4Kx4G",
  [University.UTS]: "wrsDV3XfwQB4RD7BxKD2",
  [University.SOW]: "T4qzZ5X3pGqJgJ8CMOtk",
};

export const universityNames: Record<string, University> = {
  ccSgQTXvLRnin0OjwvRM: University.UNSW,
  CZHRnKJ8SDnfMIw64WJu: University.MACQ,
  MUSmSaufEfgdJUX4Kx4G: University.USYD,
  wrsDV3XfwQB4RD7BxKD2: University.UTS,
  T4qzZ5X3pGqJgJ8CMOtk: University.SOW,
};
