/**
 * cn - Class name utility (like clsx + tailwind-merge)
 */

type ClassValue = string | number | bigint | boolean | undefined | null | ClassValue[];

function toVal(mix: ClassValue): string {
  let str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let i = 0; i < mix.length; i++) {
        if (mix[i]) {
          const val = toVal(mix[i]);
          if (val) {
            str && (str += ' ');
            str += val;
          }
        }
      }
    }
  }
  return str;
}

export function cn(...inputs: ClassValue[]): string {
  let str = '';
  for (let i = 0; i < inputs.length; i++) {
    const val = toVal(inputs[i]);
    if (val) {
      str && (str += ' ');
      str += val;
    }
  }
  return str;
}

export default cn;
