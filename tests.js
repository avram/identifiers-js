#!/usr/bin/rhino
load("identifiers.js");

var test = 0;

function assertEqual(a, b) {
	if (a === b) {
		//print("\t" + a + "\n\t" + b);
		print("Pass (" + (test++) + ")");
		return true;
	} else {
		print("\t" + a + "\n\t" + b);
		print("[31mFail (" + (test++) + ")[0m");
		return false;
	}
}

function assertTrue(a) {
	if (a) {
		//print("\t" + a);
		print("Pass (" + (test++) + ")");
		return true;
	} else {
		print("\t" + a);
		print("[31mFail (" + (test++) + ")[0m");
		return false;
	}
}

// Assertions

print("[1mISBN-10[0m");
assertEqual(idCheck("0-306-40615-2").isbn10, "0-306-40615-2");
assertEqual(idCheck("0202306070 (cloth alk. paper) 0202306089 (pbk. alk. paper)").isbn10, "0202306070");

print("[1mISBN-13[0m");
assertTrue(idCheck("9785776118555").isbn13);

print("[1mISSN[0m");
assertEqual(idCheck("0378-5955").issn, "0378-5955");
assertTrue(idCheck("0378-5955").issn);

print("[1mISSN as EAN[0m");
assertTrue(idCheck("9770317847001").issn);
assertEqual(idCheck("9770317847001").issn, "0317-8471");

print("[1mSICI[0m");
assertTrue(idCheck("0095-4403(199502/03)21:3<12:WATIIB>2.0.TX;2-J").sici);
assertTrue(idCheck("0095-4403(199502/03)21:3<12:WATIIB>2.0.TX;2-J").issn);
assertTrue(idCheck("0002-8231(199412)45:10<737:TIODIM>2.3.TX;2-M").issn);
assertTrue(idCheck("0363-0277(19950315)120:5<32:IAA>2.0.TX;2-0").issn);
assertTrue(idCheck("0363-0277(19950315)120:5<>1.0.TX;2-V").issn);
