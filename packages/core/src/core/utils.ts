import { sample } from 'underscore';
import { IDateRange, IUser } from '@gauzy/contracts';
import { moment } from './../core/moment-extend';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import slugify from 'slugify';
import { getConfig } from '@gauzy/config';

namespace Utils {
	export function generatedLogoColor() {
		return sample(['#269aff', '#ffaf26', '#8b72ff', '#0ecc9D']).replace(
			'#',
			''
		);
	}
}

export const getDummyImage = (
	width: number,
	height: number,
	letter: string
) => {
	return `https://dummyimage.com/${width}x${height}/${Utils.generatedLogoColor()}/ffffff.jpg&text=${letter}`;
};

export const getUserDummyImage = (user: IUser) => {
	const firstNameLetter = user.firstName
		? user.firstName.charAt(0).toUpperCase()
		: '';
	if (firstNameLetter) {
		return getDummyImage(330, 300, firstNameLetter);
	} else {
		const firstEmailLetter = user.email.charAt(0).toUpperCase();
		return getDummyImage(330, 300, firstEmailLetter);
	}
};

export function reflect(promise) {
	return promise.then(
		(item) => ({ item, status: 'fulfilled' }),
		(error) => ({ error, status: 'rejected' })
	);
}

/**
 * To calculate the last day of a month, we need to set date=0 and month as the next month.
 * So, if we want the last day of February (February is month = 1) we'll need to perform 'new Date(year, 2, 0).getDate()'
 */
export function getLastDayOfMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

export function arrayToObject(array, key, value) {
	return array.reduce((prev, current) => {
		return {
			...prev,
			[current[key]]: current[value]
		};
	}, {});
}

/*
 * To convert unix timestamp to datetime using date format
 */
export function unixTimestampToDate(
	timestamps,
	format = 'YYYY-MM-DD HH:mm:ss'
) {
	const millisecond = 1000;
	return moment.unix(timestamps / millisecond).format(format);
}

/*
 * To convert any datetime to any datetime format
 */
export function convertToDatetime(datetime) {
	if (moment(new Date(datetime)).isValid()) {
		const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
		if (dbType === 'sqlite') {
			return moment(new Date(datetime)).format('YYYY-MM-DD HH:mm:ss');
		} else {
			return moment(new Date(datetime)).toDate();
		}
	}
	return null;
}

export async function tempFile(prefix) {
	const tempPath = path.join(os.tmpdir(), prefix);
	const folder = await fs.promises.mkdtemp(tempPath);
	return path.join(folder, prefix + moment().unix() + Math.random() * 10000);
}

/*
 * Get date range according for different unitOfTimes
 */
export function getDateRange(
	startDate?: string | Date,
	endDate?: string | Date,
	type: 'day' | 'week' = 'day',
	isFormat: boolean = false
) {
	if (endDate === 'day' || endDate === 'week') {
		type = endDate;
	}

	let start: any = moment.utc().startOf(type);
	let end: any = moment.utc().endOf(type);

	if (startDate && endDate !== 'day' && endDate !== 'week') {
		start = moment.utc(startDate).startOf(type);
		end = moment.utc(endDate).endOf(type);
	} else {
		if (
			(startDate && endDate === 'day') ||
			endDate === 'week' ||
			(startDate && !endDate)
		) {
			start = moment.utc(startDate).startOf(type);
			end = moment.utc(startDate).endOf(type);
		}
	}

	if (!start.isValid() || !end.isValid()) {
		return;
	}

	if (end.isBefore(start)) {
		throw 'End date must be greater than start date.';
	}

	const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
	if (dbType === 'sqlite') {
		start = start.format('YYYY-MM-DD HH:mm:ss');
		end = end.format('YYYY-MM-DD HH:mm:ss');
	} else {
		if (!isFormat) {
			start = start.toDate();
			end = end.toDate();
		} else {
			start = start.format();
			end = end.format();
		}
	}

	return {
		start,
		end
	};
}

export function generateSlug(string: string) {
	return slugify(string, {
		replacement: '-', // replace spaces with replacement character, defaults to `-`
		remove: /[*+~()'"!:@,.]/g, // remove characters that match regex, defaults to `undefined`
		lower: true, // convert to lower case, defaults to `false`
		trim: true // trim leading and trailing replacement chars, defaults to `true`
	});
}

export const getOrganizationDummyImage = (name: string) => {
	const firstNameLetter = name ? name.charAt(0).toUpperCase() : '';
	return getDummyImage(330, 300, firstNameLetter);
};

export const getTenantLogo = (name: string) => {
	const firstNameLetter = name ? name.charAt(0).toUpperCase() : '';
	return getDummyImage(330, 300, firstNameLetter);
};

/**
 * Merge Overlapping Date & Time
 *
 * @param ranges
 * @returns
 */
export function mergeOverlappingDateRanges(
	ranges: IDateRange[],
): IDateRange[] {
	const sorted = ranges.sort(
		// By start, ascending
		(a, b) => a.start.getTime() - b.start.getTime(),
	);

	const dates = sorted.reduce((acc, curr) => {
		// Skip the first range
		if (acc.length === 0) {
			return [curr];
		}

		const prev = acc.pop();

		if (curr.end <= prev.end) {
			// Current range is completely inside previous
			return [...acc, prev];
		}

		// Merges overlapping (<) and contiguous (==) ranges
		if (curr.start <= prev.end) {
			// Current range overlaps previous
			return [...acc, { start: prev.start, end: curr.end }];
		}

		// Ranges do not overlap
		return [...acc, prev, curr];

	}, [] as IDateRange[]);

	return dates;
}

/**
 * GET Date Range Format
 *
 * @param startDate
 * @param endDate
 * @returns
 */
export function getDateRangeFormat(
	startDate: moment.Moment,
	endDate: moment.Moment
): {
	start: string | Date,
	end: string | Date
} {
	let start = moment(startDate);
	let end = moment(endDate);

	if (!start.isValid() || !end.isValid()) {
		return;
	}
	if (end.isBefore(start)) {
		throw 'End date must be greater than start date.';
	}

	const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
	if (dbType === 'sqlite') {
		return {
			start: start.format('YYYY-MM-DD HH:mm:ss'),
			end: end.format('YYYY-MM-DD HH:mm:ss')
		}
	} else {
		return {
			start: start.toDate(),
			end: end.toDate()
		}
	}
}

/**
 * Get All Dates Between Two Dates in Moment JS
 *
 * @param startDate
 * @param endDate
 * @returns
 */
export function getDaysBetweenDates(
	startDate: string | Date,
	endDate: string | Date
): string[] {
	const start = moment(moment(startDate).format('YYYY-MM-DD')).add(1, 'day');
	const end = moment(moment(endDate).format('YYYY-MM-DD'));
	const range = Array.from(moment.range(start, end).by('day'));

	const days: Array<string> = new Array();
	let i = 0;
	while (i < range.length) {
		const date = range[i].format('YYYY-MM-DD');
		days.push(date);
		i++;
	}

	return days;
}

/**
 * Generating a random integer number with flexible length
 *
 * @param length
 */
export function generateRandomInteger(length = 6) {
	return Math.floor(
		Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1)
	);
}