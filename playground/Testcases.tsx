import { useRef } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import type { UpdateMermaidDefinition } from "./index.tsx";
import Testcase, { type SingleTestCaseProps } from "./SingleTestCase.tsx";

interface TestcasesProps {
  onChange: UpdateMermaidDefinition;
  isCustomTest: boolean;
  error: SingleTestCaseProps["error"];
}

const Testcases = ({ onChange, error, isCustomTest }: TestcasesProps) => {
  const activeTestcase = useRef<[number, number]>();

  const testCases = [
    { name: "Flowchart", testcases: FLOWCHART_DIAGRAM_TESTCASES },
    { name: "Sequence", testcases: SEQUENCE_DIAGRAM_TESTCASES },
    { name: "Class", testcases: CLASS_DIAGRAM_TESTCASES },
    { name: "Unsupported", testcases: UNSUPPORTED_DIAGRAM_TESTCASES },
  ];

  return (
    <>
      {testCases.map(({ name, testcases }, index) => (
        <Testcase
          key={index}
          name={name}
          activeTestcaseIndex={
            activeTestcase.current?.[0] === index
              ? activeTestcase.current[1]
              : undefined
          }
          onChange={(definition, activeTestcaseIndex) => {
            activeTestcase.current = [index, activeTestcaseIndex];

            onChange(definition, false);
          }}
          testcases={testcases}
          error={isCustomTest ? null : error}
        />
      ))}
    </>
  );
};

export default Testcases;
