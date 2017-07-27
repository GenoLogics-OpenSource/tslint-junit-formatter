import * as ts from 'typescript';
import * as NodeUnit from 'nodeunit';
import * as Lint from 'tslint';
import * as dedent from 'dedent';
import { Formatter } from './junitFormatter';

export const formatterTests: NodeUnit.ITestGroup = {
    "zero failures": (test: NodeUnit.Test) => {
        const formatter = new Formatter();

        const output = formatter.format([]);
        const expected = dedent(`
            <?xml version="1.0" encoding="utf-8"?>
            <testsuites>
            <testsuite time="0" tests="1" skipped="0" errors="0" failures="0" package="org.tslint" name="tslint.xml">
            <testcase time="0" name="success"/>
            </testsuite>
            </testsuites>
        `);
        test.equal(output, expected);
        test.done();
    },

    "one failure": (test: NodeUnit.Test) => {
        const formatter = new Formatter();

        const code = `class Test {}`;
        const fileName = "one_failure.ts";
        const message = "testFailure";
        const ruleName = "testRuleName";
        const character = 6;
        const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2015);
        const failures = [new Lint.RuleFailure(<ts.SourceFile> sourceFile, character, character, message, ruleName)];
        const output = formatter.format(failures);
        const expected = dedent(`
            <?xml version="1.0" encoding="utf-8"?>
            <testsuites>
            <testsuite time="0" tests="1" skipped="0" errors="1" failures="0" package="org.tslint" name="tslint.xml">
            <testcase time="0" name="org.tslint.${ruleName}"><error message="${message} (org.tslint.${ruleName})"><![CDATA[0:${character}:${fileName}]]></error></testcase>
            </testsuite>
            </testsuites>
        `);
        test.equal(output, expected);
        test.done();
    },

    "multiple failures in one file": (test: NodeUnit.Test) => {
        const formatter = new Formatter();

        const code = `class Test {}`;
        const fileName = "two_failures.ts";
        const message = "testFailure";
        const ruleName = "testRuleName";
        const character = 6;
        const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2015);
        const failures = [
            new Lint.RuleFailure(<ts.SourceFile> sourceFile, character, character, message, ruleName),
            new Lint.RuleFailure(<ts.SourceFile> sourceFile, character + 1, character + 1, message, ruleName)
        ];
        const output = formatter.format(failures);
        const expected = dedent(`
            <?xml version="1.0" encoding="utf-8"?>
            <testsuites>
            <testsuite time="0" tests="2" skipped="0" errors="2" failures="0" package="org.tslint" name="tslint.xml">
            <testcase time="0" name="org.tslint.${ruleName}"><error message="${message} (org.tslint.${ruleName})"><![CDATA[0:${character}:${fileName}]]></error></testcase>
            <testcase time="0" name="org.tslint.${ruleName}"><error message="${message} (org.tslint.${ruleName})"><![CDATA[0:${character + 1}:${fileName}]]></error></testcase>
            </testsuite>
            </testsuites>
        `);
        test.equal(output, expected);
        test.done();
    },

    "multiple failures in multiple files": (test: NodeUnit.Test) => {
        const formatter = new Formatter();

        const code1 = `class Test {}`;
        const fileName1 = "some_failures.ts";
        const message1 = "testFailure";
        const ruleName1 = "testRuleName";
        const sourceFile1 = ts.createSourceFile(fileName1, code1, ts.ScriptTarget.ES2015);

        const code2 = `class AnotherTest {}`;
        const fileName2 = "more_failures.ts";
        const message2 = "testAnotherFailure";
        const ruleName2 = "testAnotherRuleName";
        const sourceFile2 = ts.createSourceFile(fileName2, code2, ts.ScriptTarget.ES2015);

        const failures = [
            new Lint.RuleFailure(<ts.SourceFile> sourceFile1, 0, 0, message1, ruleName1),
            new Lint.RuleFailure(<ts.SourceFile> sourceFile1, 1, 1, message2, ruleName2),
            new Lint.RuleFailure(<ts.SourceFile> sourceFile2, 0, 0, message1, ruleName1),
            new Lint.RuleFailure(<ts.SourceFile> sourceFile2, 1, 1, message2, ruleName2)
        ];
        const output = formatter.format(failures);
        const expected = dedent(`
            <?xml version="1.0" encoding="utf-8"?>
            <testsuites>
            <testsuite time="0" tests="4" skipped="0" errors="4" failures="0" package="org.tslint" name="tslint.xml">
            <testcase time="0" name="org.tslint.${ruleName1}"><error message="${message1} (org.tslint.${ruleName1})"><![CDATA[0:0:${fileName1}]]></error></testcase>
            <testcase time="0" name="org.tslint.${ruleName2}"><error message="${message2} (org.tslint.${ruleName2})"><![CDATA[0:1:${fileName1}]]></error></testcase>
            <testcase time="0" name="org.tslint.${ruleName1}"><error message="${message1} (org.tslint.${ruleName1})"><![CDATA[0:0:${fileName2}]]></error></testcase>
            <testcase time="0" name="org.tslint.${ruleName2}"><error message="${message2} (org.tslint.${ruleName2})"><![CDATA[0:1:${fileName2}]]></error></testcase>
            </testsuite>
            </testsuites>
        `);
        test.equal(output, expected);
        test.done();
    }
};
