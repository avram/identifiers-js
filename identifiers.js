var exports = [idCheck, getCheckDigit, parseSICI];

var idCheck = function(isbn) {
	var data = parseSICI(isbn);
	if (data !== false)
		return {"isbn10" : false,
			"isbn13" : false,
			"issn" : data.ISSN,
			"upc" : false,
			"ean" : false,
			"sici" : isbn};
	
	// For ISBN 10, multiple by these coefficients, take the sum mod 11
	// and subtract from 11
	var isbn10 = [10, 9, 8, 7, 6, 5, 4, 3, 2];

	// For ISBN 13, multiple by these coefficients, take the sum mod 10
	// and subtract from 10
	var isbn13 = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];

	// For ISSN, multiply by these coefficients, take the sum mod 11
	// and subtract from 11
	var issn =   [8, 7, 6, 5, 4, 3, 2];
	
	// For UPC, multiply by these coefficients, take the sum mod 10
	// and subtract from 10
	var upc =   [3, 1, 3, 1, 3, 1, 3, 1, 3];

	// We make a single pass through the provided string, interpreting the
	// first 10 valid characters as an ISBN-10, and the first 13 as an
	// ISBN-13. We then return an array of booleans and valid detected
	// ISBNs.

	var j = 0;
	var sum8 = 0;
	var num8 = "";
	var sum10 = 0;
	var sum_upc = 0;
	var num10 = "";
	var sum13 = 0;
	var num13 = "";
	var chars = [];

	for (var i=0; i < isbn.length; i++) {
		if (isbn.charAt(i) == " ") {
			// Since the space character evaluates as a number,
			// it is a special case.
		} else if (j > 0 && isbn.charAt(i) == "-" && isbn.charAt(i-1) != "-") {
			// Preserve hyphens, except in initial and final position
			// Also discard consecutive hyphens
			if(j < 7) num8 += "-";
			if(j < 10) num10 += "-";
			if(j < 13) num13 += "-";
		} else if (j < 7 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum8 += isbn.charAt(i) * issn[j];
			sum10 += isbn.charAt(i) * isbn10[j];
			sum_upc += isbn.charAt(i) * upc[j];
			sum13 += isbn.charAt(i) * isbn13[j];
			num8 += isbn.charAt(i);
			num10 += isbn.charAt(i);
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 7 &&
			(isbn.charAt(i) == "X" || isbn.charAt(i) == "x" ||
				((isbn.charAt(i) - 0) == isbn.charAt(i)))) {
			// In ISSN, an X represents the check digit "10".
			if(isbn.charAt(i) == "X" || isbn.charAt(i) == "x") {
				var check8 = 10;
				num8 += "X";
			} else {
				var check8 = isbn.charAt(i);
				sum10 += isbn.charAt(i) * isbn10[j];
				sum_upc += isbn.charAt(i) * upc[j];
				sum13 += isbn.charAt(i) * isbn13[j];
				num8 += isbn.charAt(i);
				num10 += isbn.charAt(i);
				num13 += isbn.charAt(i);
				j++;
			}
		} else if (j < 9 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum10 += isbn.charAt(i) * isbn10[j];
			sum_upc += isbn.charAt(i) * upc[j];
			sum13 += isbn.charAt(i) * isbn13[j];
			num10 += isbn.charAt(i);
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 9 &&
			(isbn.charAt(i) == "X" || isbn.charAt(i) == "x" ||
				((isbn.charAt(i) - 0) == isbn.charAt(i)))) {
			// In ISBN-10, an X represents the check digit "10".
			if(isbn.charAt(i) == "X" || isbn.charAt(i) == "x") {
				var check10 = 10;
				num10 += "X";
			} else {
				var check10 = isbn.charAt(i);
				var check_upc = isbn.charAt(i);
				sum13 += isbn.charAt(i) * isbn13[j];
				num10 += isbn.charAt(i);
				num13 += isbn.charAt(i);
				j++;
			}
		} else if(j < 12 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum13 += isbn.charAt(i) * isbn13[j];
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 12 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			var check13 = isbn.charAt(i);
			num13 += isbn.charAt(i);
		}
	}
	var valid8  = ((11 - sum8 % 11) % 11) == check8;
	var valid10 = ((11 - sum10 % 11) % 11) == check10;
	var valid_upc = ((10 - sum_upc % 10) % 10) == check_upc;
	var valid13 = ((10 - sum13 % 10) % 10) == check13;
	var matches = false;
	
	var num_upc = num10;
	var num_ean = num13;
	var num_issn13 = num13;

	if(!valid10) {num10 = false};
	if(!valid_upc) {num_upc = false};
	if(!valid13) {num_ean = false; num13 = false;};

	// Enforce that UPC-13 is an EAN from Bookland, with prefix 978 or 979
	if(num13 && !num13.match(/^97[89]/)) num13 = false;

	// Extract an ISSN from its EAN representation, prefix 977
	if (num_ean && num_ean.match(/^977/)) {
		first7 = num_ean.replace(/[^0-9x]/gi, '').substr(3, 7);
		num8 = first7.concat(getCheckDigit(first7, issn, 11));
		valid8 = true;
	}
	
	// Since ISSNs have a standard hyphen placement, we can add a hyphen
	if (valid8 && (matches = num8.match(/([0-9]{4})([0-9]{3}[0-9Xx])/))) {
		num8 = matches[1] + '-' + matches[2];
	} 
	if(!valid8) {num8 = false};


	return {"isbn10" : num10, "isbn13" : num13, "issn" : num8, "upc" : num_upc, "ean" : num_ean};
}

var getCheckDigit = function(input, coefficients, modulo) {
	var i = 0;
	var sum = 0;
	for (i=0; i < coefficients.length; i++) {
		sum += input.charAt(i) * coefficients[i];
	}

	var check = ((modulo - sum % modulo) % modulo);
	return ( check == 10 ) ? "X" : check;
}

/*
Parses Serial Item and Contribution Identifiers (SICI)
ANSI/NISO standard Z39.56
http://www.niso.org/standards/z39-56-1996r2002 
In MARC: http://www.loc.gov/marc/bibliographic/bd024.html
As URNs: http://tools.ietf.org/html/draft-hakala-sici-01
More info: http://tools.ietf.org/html/rfc2288
Also see Wikipedia: http://en.wikipedia.org/wiki/Serial_Item_and_Contribution_Identifier

Examples from Wikipedia:
Abstract from Lynch, Clifford A. “The Integrity of Digital Information; Mechanics and Definitional Issues.” JASIS 45:10 (Dec. 1994) p. 737-44
SICI: 0002-8231(199412)45:10<737:TIODIM>2.3.TX;2-M

Bjorner, Susanne. “Who Are These Independent Information Brokers?” Bulletin of the American Society for Information Science, Feb-Mar. 1995, Vol. 21, no. 3, page 12
SICI: 0095-4403(199502/03)21:3<12:WATIIB>2.0.TX;2-J

 */
var parseSICI = function(input) {
	var data = {};
	var pieces, chronology, enumeration, contribution, csi, dpi, mfi, version, check;
	pieces = input.match(/([0-9]{4}-[0-9]{4})\(([^)]*)\)([^<]*)<([^>]*)>([0-9])\.([0-9])\.([A-Z]{2});([0-9])-([0-9A-Z])/);
	if (!pieces) return false;
	data.ISSN = pieces[1];
	data.chronology = pieces[2];
	data.enumeration = pieces[3];
	data.contribution = pieces[4];
	data.csi = pieces[5];
	data.dpi = pieces[6];
	data.mfi = pieces[7];
	data.version = pieces[8];
	data.check = pieces[9];
	//print(input);
	//outer(data);
	return data;
}

function outer(inner) {
	var i;
	for (i in inner) {
		print(i + " => " + inner[i]);
	}
}
