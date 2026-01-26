export default function convertBigIntToNumber(obj: any, visited = new WeakSet()): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "object" && visited.has(obj)) return null;
    if (typeof obj === "bigint") return Number(obj);
    if (obj && typeof obj === "object" && obj.constructor && obj.constructor.name === "ObjectId") return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (obj instanceof RegExp || obj instanceof Map || obj instanceof Set) return obj.toString();
    if (Array.isArray(obj)) {
        visited.add(obj);
        const result = obj.map((item) => convertBigIntToNumber(item, visited));
        visited.delete(obj);
        return result;
    }
    if (typeof obj === "object") {
        visited.add(obj);
        const converted: any = {};
        for (const key in obj) {
            if (key.startsWith("_") || key === "$__" || key === "isNew") continue;

            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                try {
                    const value = obj[key];
                    if (value && typeof value === "object" && value.constructor && value.constructor.name === "ObjectId") converted[key] = value.toString();
                    else converted[key] = convertBigIntToNumber(value, visited);
                } catch (e) {
                    console.warn(`Skipping key ${key} due to error:`, e);
                }
            }
        }
        visited.delete(obj);
        return converted;
    }
    return obj;
}