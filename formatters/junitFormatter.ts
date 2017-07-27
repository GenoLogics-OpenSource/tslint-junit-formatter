import * as Lint from "tslint";

/*
 * TSLint formatter that adheres to the JUnit XML specification.
 * https://github.com/windyroad/JUnit-Schema/blob/master/JUnit.xsd
 */
export class Formatter extends Lint.Formatters.AbstractFormatter {

    /**
     * Transform characters that cause trouble in attribute values
     */
    private escape(input: string): string {
        if (!input) {
            return "";
        }

        return input.replace(/"/g, "'").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /**
     * Generate a java-style package name for a rule
     */
    private generateName(ruleName: string): string {
        if (!ruleName) {
            return "";
        }

        return "org.tslint." + ruleName.replace(/\s/g, "");
    }

    /**
     * Generate an error <testcase> element
     */
    private testcaseXML(ruleFailure: Lint.RuleFailure): string {
        const ruleName = this.generateName(ruleFailure.getRuleName());
        const message = this.escape(ruleFailure.getFailure());
        const startPosition = ruleFailure.getStartPosition();
        const { line, character } = startPosition.getLineAndCharacter();
        const fileName = ruleFailure.getFileName();

        return `<testcase time="0" name="${ruleName}"><error message="${message} (${ruleName})"><![CDATA[${line}:${character}:${fileName}]]></error></testcase>`;
    }

    /**
     * Generate a <testsuite> element without a closing tag
     */
    private testsuiteStartXML(failures: Lint.RuleFailure[]): string {
        return `<testsuite time="0" tests="${failures.length}" skipped="0" errors="${failures.length}" failures="0" package="org.tslint" name="tslint.xml">`;
    }

    /**
     * Generate a <testsuite> element that represents no failures
     */
    private successTestSuiteXML(): string {
        return `<testsuite time="0" tests="1" skipped="0" errors="0" failures="0" package="org.tslint" name="tslint.xml">\n<testcase time="0" name="success"/>\n</testsuite>`;
    }

    /**
     * Transform lint failure to JUnit XML format
     */
    public format(failures: Lint.RuleFailure[]): string {
        let xml = [];

        xml.push(`<?xml version="1.0" encoding="utf-8"?>`);
        xml.push("<testsuites>");

        if (failures.length > 0) {
            xml.push(this.testsuiteStartXML(failures));
            xml = xml.concat(failures.map(failure => this.testcaseXML(failure)));
            xml.push("</testsuite>");
        } else {
            xml.push(this.successTestSuiteXML());
        }

        xml.push("</testsuites>");
        return xml.join('\n');
    }
}
