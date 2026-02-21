export const RECIPE_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type RecipeStatus = (typeof RECIPE_STATUS)[keyof typeof RECIPE_STATUS];

export const RECIPE_STATUS_OPTIONS: { value: RecipeStatus; label: string }[] = [
  { value: RECIPE_STATUS.DRAFT, label: "Draft" },
  { value: RECIPE_STATUS.PUBLISHED, label: "Published" },
  { value: RECIPE_STATUS.ARCHIVED, label: "Archived" },
];

export const RECIPE_DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type RecipeDifficulty =
  (typeof RECIPE_DIFFICULTY)[keyof typeof RECIPE_DIFFICULTY];

export const RECIPE_DIFFICULTY_OPTIONS: {
  value: RecipeDifficulty;
  label: string;
}[] = [
  { value: RECIPE_DIFFICULTY.EASY, label: "Easy" },
  { value: RECIPE_DIFFICULTY.MEDIUM, label: "Medium" },
  { value: RECIPE_DIFFICULTY.HARD, label: "Hard" },
];
