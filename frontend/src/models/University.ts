export enum University {
  USYD = "University of Sydney",
  UNSW = "University of New South Wales",
  UTS = "University of Technology, Sydney",
  MACQ = "Macquarie University",
  ACU = "Australian Catholic University",
  WSU = "Western Sydney University",
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
