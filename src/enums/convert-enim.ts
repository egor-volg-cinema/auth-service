export function convertEnum<T extends Record<string, string | number>>(
	target: T,
	value: keyof T
): T[keyof T] {
	return target[value]
}
