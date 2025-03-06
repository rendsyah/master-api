import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import dayjs from 'dayjs';
import argon2 from '@node-rs/argon2';

import { AppConfigService } from '../config';

import {
  IPagination,
  IPaginationFilter,
  IPaginationResponse,
  IValidateRandomChar,
  IValidateReplacePhone,
  IValidateString,
} from './utils.types';

@Injectable()
export class UtilsService {
  constructor(private readonly appConfigService: AppConfigService) {}

  public validateString(request: string, type: IValidateString): string {
    if (!request) return '';

    switch (type) {
      case 'char':
        return request.replace(/[^a-z\d\s]+/gi, '');

      case 'numeric':
        return request.replace(/[^0-9]/g, '');

      case 'encode':
        return Buffer.from(request).toString('base64');

      case 'decode':
        return Buffer.from(request, 'base64').toString('ascii');

      default:
        return '';
    }
  }

  public validateUpperCase(request: string): string {
    if (!request) return '';

    const splitRequest = request.split(' ');
    const result: string[] = [];

    splitRequest.forEach((value) => {
      result.push(value.charAt(0).toUpperCase() + value.slice(1));
    });

    return result.join(' ');
  }

  public validateSlug(request: string): string {
    return request
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public validateReplaceMessage(request: string, variables: string[]): string {
    if (!request) return '';

    variables.forEach((v, i) => {
      request = request.replace(`{{${i + 1}}}`, v);
    });

    return request;
  }

  public validateReplacePhone(request: string, type: IValidateReplacePhone): string {
    if (!request) return '';

    const checkPrefix = request.substring(0, 2);
    const getPhone = request.slice(2);

    switch (type) {
      case '08':
        if (checkPrefix === '08') {
          return request;
        }
        return checkPrefix.replace(checkPrefix, '0') + getPhone;

      case '62':
        if (checkPrefix === '62') {
          return request;
        }
        return checkPrefix.replace(checkPrefix, '628') + getPhone;
    }
  }

  public validateRandomChar(request: number, type: IValidateRandomChar): string {
    if (!request) return '';

    let characters = '';
    let charactersResult = '';

    switch (type) {
      case 'alpha':
        characters = 'qwertyuiopasdfghjklzxcvbnm';
        break;

      case 'numeric':
        characters = '1234567890';
        break;

      case 'alphanumeric':
        characters = '1234567890qwertyuiopasdfghjklzxcvbnm';
        break;
    }

    for (let index = 0; index < request; index++) {
      const random = Math.floor(Math.random() * characters.length);
      charactersResult += characters[random].toUpperCase();
    }

    return charactersResult;
  }

  public validateEncrypt(request: string): string {
    const cryptoIv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.appConfigService.CRYPTO_SECRET, cryptoIv);
    const encrypted = Buffer.concat([cipher.update(request, 'utf-8'), cipher.final()]);
    const encryptedTag = cipher.getAuthTag();

    const finalResult = Buffer.concat([cryptoIv, encryptedTag, encrypted]).toString('base64url');

    return finalResult;
  }

  public validateDecrypt(request: string): string | null {
    const data = Buffer.from(request, 'base64url');
    const cryptoIv = data.subarray(0, 12);
    const encryptedTag = data.subarray(12, 28);
    const encryptedText = data.subarray(28);

    const decipher = createDecipheriv('aes-256-gcm', this.appConfigService.CRYPTO_SECRET, cryptoIv);

    decipher.setAuthTag(encryptedTag);

    const finalResult = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]).toString();

    return finalResult;
  }

  public validateSafeJSON<T>(request: string, fallback: T): T {
    return typeof request === 'string' && request.trim() !== ''
      ? (JSON.parse(request) as T)
      : fallback;
  }

  public async validateHash(request: string): Promise<string> {
    return await argon2.hash(request);
  }

  public async validateCompare(hash: string, request: string): Promise<boolean> {
    return await argon2.verify(hash, request);
  }

  public validateMasked(request: string, start: number, end: number): string {
    const splitRequest = request.split(' ');

    const maskRequest = splitRequest.map((req) => {
      const requestLength = req.length;

      if (start + end >= requestLength) {
        return '*'.repeat(requestLength);
      }

      const startMask = req.slice(0, start);
      const midMask = '*'.repeat(requestLength - start - end);
      const endMask = req.slice(requestLength - end);

      return `${startMask}${midMask}${endMask}`;
    });

    return maskRequest.join(' ');
  }

  public pagination(request: IPagination): IPagination {
    const getPage = request.page ? +request.page : 1;
    const getLimit = request.limit ? +request.limit : 10;
    const getStatus = request.status ? +request.status : undefined;
    const getOrderBy = request.orderBy ? request.orderBy : '';
    const getSort = request.sort ? (request.sort.toUpperCase() as IPagination['sort']) : 'DESC';
    const getSearch = request.search ? request.search : '';
    const getStartDate = request.startDate ? dayjs(request?.startDate).format('YYYY-MM-DD') : '';
    const getEndDate = request.endDate ? dayjs(request?.endDate).format('YYYY-MM-DD') : '';
    const getUsers = request.users ? request.users : undefined;
    const getSkip = (getPage - 1) * getLimit;

    return {
      page: getPage,
      limit: getLimit,
      status: getStatus,
      orderBy: getOrderBy,
      sort: getSort,
      search: getSearch,
      startDate: getStartDate,
      endDate: getEndDate,
      users: getUsers,
      skip: getSkip,
    };
  }

  public paginationFilter(request: IPaginationFilter): string {
    const getStartDate = request.startDate;
    const getEndDate = request.endDate;
    const getColumn = request.column;

    let getFilter = '';

    if (getStartDate && getEndDate) {
      getFilter = `AND DATE_FORMAT(${getColumn}, '%Y-%m-%d') >= '${getStartDate}' AND DATE_FORMAT(${getColumn}, '%Y-%m-%d') <= '${getEndDate}'`;
    }

    return getFilter;
  }

  public paginationInfiniteResponse<T>(request: IPaginationResponse<T>): IPaginationResponse<T> {
    const getData = request.data.length > 0 ? request.data : [];
    const getLimit = request.limit ? request.limit : 10;
    const getMore = getData.length >= getLimit;

    return {
      data: getData,
      getMore: getMore,
    };
  }

  public paginationResponse<T>(request: IPaginationResponse<T>): IPaginationResponse<T> {
    const getData = request.data.length > 0 ? request.data : [];
    const getPage = request.page ? request.page : 1;
    const getLimit = request.limit ? request.limit : 10;
    const getTotalData = request.totalData ? request.totalData : 0;
    const getTotalPage = Math.ceil(getTotalData / getLimit);

    return {
      data: getData,
      page: getPage,
      totalData: getTotalData,
      totalPage: getTotalPage,
      totalPerPage: getLimit,
    };
  }
}
