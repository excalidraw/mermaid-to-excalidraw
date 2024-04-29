import { useEffect, useRef, useState } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import type { UpdateMermaidDefinition } from "./index.tsx";
import SingleTestCase from "./SingleTestCase.tsx";

interface TestcasesProps {
  onChange: UpdateMermaidDefinition;
  isCustomTest: boolean;
}

const Testcases = ({ onChange }: TestcasesProps) => {
  const [[activeTestCaseFileIndex, activeTestCaseIndex], setActiveTestCase] =
    useState<[number | undefined, number | undefined] | []>([]);

  const testCases = [
    { name: "Flowchart", testcases: FLOWCHART_DIAGRAM_TESTCASES },
    { name: "Sequence", testcases: SEQUENCE_DIAGRAM_TESTCASES },
    { name: "Class", testcases: CLASS_DIAGRAM_TESTCASES },
    { name: "Unsupported", testcases: UNSUPPORTED_DIAGRAM_TESTCASES },
  ];

  useEffect(() => {
    if (
      activeTestCaseIndex !== undefined &&
      activeTestCaseFileIndex !== undefined
    ) {
      const { definition } =
        testCases[activeTestCaseFileIndex].testcases[activeTestCaseIndex];

      onChange(definition, false);
    }
  }, [activeTestCaseFileIndex, activeTestCaseIndex]);

  return (
    <>
      {testCases.map(({ name, testcases }, fileIndex) => (
        <SingleTestCase
          key={fileIndex}
          name={name}
          onChange={(activeCase) => {
            setActiveTestCase([fileIndex, activeCase]);
          }}
          testcases={testcases}
        />
      ))}
    </>
  );
};

export default Testcases;
