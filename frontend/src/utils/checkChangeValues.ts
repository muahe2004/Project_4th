import dayjs from "dayjs";

export function hasObjectChanged<
  T extends Record<string, any>
>(
  current: T,
  initial: T,
  dateKeys: (keyof T)[] = [],
  ignoreKeys: (keyof T)[] = []
): boolean {
  return Object.keys(current)
    .filter((key) => !ignoreKeys.includes(key as keyof T))
    .some((key) => {
      const k = key as keyof T;
      let currentVal = current[k];
      let initialVal = initial[k];

      if (dateKeys.includes(k)) {
        currentVal = dayjs(currentVal as any).format("YYYY-MM-DD") as any;
        initialVal = dayjs(initialVal as any).format("YYYY-MM-DD") as any;
      }

      return currentVal !== initialVal;
    });
}
