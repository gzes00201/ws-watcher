
import {
  chunk as loadash_chunk, cloneDeep as lodash_cloneDeep, difference as lodash_difference, fill as lodash_fill, find as lodash_find, findIndex as loadash_findIndex, findKey as lodash_findKey, flatMapDepth as lodash_flatMapDepth,
  flattenDepth as lodash_flattenDepth, forEach as lodash_forEach, get as lodash_get, has as lodash_has, intersection as lodash_intersection, isEqual as lodash_isEqual, isNull as lodash_isNull, map as lodash_map, maxBy as lodash_maxBy, merge as lodash_merge, min as lodash_min, orderBy as lodash_orderBy, pick as lodash_pick,
  pickBy as lodash_pickBy, random as lodash_random, reject as lodash_reject, sampleSize as lodash_sampleSize, sortBy as lodash_sortBy, uniq as loadash_uniq, values as lodash_values,
  intersectionWith as lodash_intersectionWith,
  union as lodash_union,
  concat as lodash_concat,
} from 'lodash';



type List<T> = ArrayLike<T>;

const isNotNaN = (value: any) => Number(value) === Number(value);

export function uniq<T>(list: any): T[] {
  return loadash_uniq(list);
}

export function intersection<T>(...arrays: any): T[] {
  return lodash_intersection<T>(...arrays);
}

export function cloneDeep(value: object | any): object | any {
  return lodash_cloneDeep(value);
}

export function get(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
) {
  return lodash_get(object, keys, defaultVal);
}

export function getString(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
): string {
  return String(get(object, keys, defaultVal));
}

export function getNumber(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
): number {
  return Number(get(object, keys, defaultVal));
}

export function getBoolean(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
): boolean {
  return !!get(object, keys, defaultVal);
}

export function isObject(data: any): boolean {
  return typeof data === 'object' && !Array.isArray(data) && data !== null;
}

export function isArray(data: any): boolean {
  return typeof data === 'object' && Array.isArray(data);
}

export function getStringArray(list: any): Array<string> {
  const data: any = isArray(list) ? list : [];
  return data.map((item: any) => String(item));
}

export function values(data: any): any {
  return lodash_values(data);
}

export function has(data: object, path: any | string): boolean {
  return lodash_has(data, path);
}

export function map(collection: any | object, iteratee?: any): any {
  return lodash_map(collection, iteratee);
}

export function forEach(collection: any | object, iteratee?: any): any {
  return lodash_forEach(collection, iteratee);
}

export function getMapFromObject(obj: object): Map<string, number> {
  const data = new Map<string, number>();

  if (!isObject(obj)) {
    return data;
  }

  Object.keys(obj).forEach((oddkey) => {
    data.set(oddkey, get(obj, oddkey));
  });

  return data;
}

export function getObjectFromMap(mapData: Map<string, any>): object {
  const data: any = {};
  try {
    mapData.forEach((value, key) => {
      data[key] = value;
    });
  } catch (err) {
    console.error('not Map', err);
  }

  return data;
}

export function findIndex(data: Array<any>, iteratee: any) {
  return loadash_findIndex(data, iteratee);
}

export function find<T>(
  collection: Array<any> | object,
  predicate?: any,
  fromIndex?: number
): T {
  return lodash_find(collection, predicate, fromIndex) as unknown as T;
}

export function flatMapDepth<T>(
  collection: Array<T> | object,
  iteratee?: any,
  depth?: number
): T {
  const data: any = lodash_flatMapDepth(collection, iteratee, depth);
  return data;
}

export function chunk<T>(
  array: List<T> | null | undefined,
  size?: number
): T[][] {
  return loadash_chunk(array, size);
}

export function min<T>(array: Array<any>): any {
  return lodash_min(array);
}

export function difference(array: Array<any>, value?: Array<any>): Array<any> {
  return lodash_difference(array, value ? value: []);
}

export function isNumber(value: any): boolean {
  return isNotNaN(Number(value)) && typeof Number(value) === 'number';
}

export function findKey(object: any, predicate: any): any {
  return lodash_findKey(object, predicate);
}

export function flattenDepth(array: Array<any>, depth = 1): Array<any> {
  return lodash_flattenDepth(array, depth);
}

export function parseObjectValues(obj: any): Array<any> {
  if (!isObject(obj)) {
    return [];
  }

  return Object.keys(obj).map((key) => obj[key]);
}

export function sortBy(
  collection: Array<any> | object,
  iteratees: any
): any[] {
  return lodash_sortBy(collection, iteratees);
}

export function sampleSize(collection: Array<any> | object, n?: number): any[] {
  return lodash_sampleSize(collection, n);
}

export function random(
  lower: number,
  upper: number,
  floating?: boolean
): number {
  return lodash_random(lower, upper, floating);
}

export function merge(object: object, ...sources: object[]): object {
  return lodash_merge(object, ...sources);
}

export function orderBy(
  collection: [] | object,
  iteratees?: any,
  orders?: []
): any[] {
  return lodash_orderBy(collection, iteratees, orders);
}

export function isNull(value: any): boolean {
  return lodash_isNull(value);
}

export function reject(collection: any, predicate?: any): Array<any> {
  return lodash_reject(collection, predicate);
}

export function fill(
  array: Array<any>,
  value: any,
  start?: number,
  end?: number
): Array<any> {
  return lodash_fill(array, value, start, end);
}

export function maxBy(array: Array<any>, iteratee?: any): Array<any> {
  return lodash_maxBy(array, iteratee);
}

export function pick(object: object, paths?: any): object {
  return lodash_pick(object, paths);
}

export function pickBy(object: object, predicate?: (obj?: any) => any): object {
  return lodash_pickBy(object, predicate);
}

export function getObjectValuesByNum(obj: any): any{
  if (isArray(obj)) return obj
  if (!obj) return []

  const keys = Object.keys(obj).sort((a, b) => Number(a) - Number(b))
  const values: any = []

  keys.forEach(key => {
    values.push(obj[key])
  })

  return values
}

export function isEqual(value: any, other: any): boolean {
  return lodash_isEqual(value, other);
}

export function intersectionWith(array1: any[], array2: any[], comparator: any) {
  return lodash_intersectionWith(array1, array2, comparator);
}

export function union(...arrays: Array<any>): Array<any> {
  return lodash_union(...arrays);
}

type Many<T> = T | ReadonlyArray<T>;
export function concat<T>(...values: Array<Many<T>>): T[] {
  return lodash_concat(...values);
}
