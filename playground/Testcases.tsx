import { useEffect, useState } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import SingleTestCase from "./SingleTestCase.tsx";
import type { MermaidData } from "./index.tsx";

interface TestcasesProps {
  onChange: (definition: MermaidData["definition"], isCustom: boolean) => void;
  isCustomTest: boolean;
}

const Testcases = ({ onChange }: TestcasesProps) => {
  const [[activeTestCaseFileIndex, activeTestCaseIndex], setActiveTestCase] =
    useState<[number | undefined, number | undefined] | []>([]);
  const [updateKey, setUpdateKey] = useState(0);

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
  }, [activeTestCaseFileIndex, activeTestCaseIndex, updateKey]);

  return (
    <>
      {testCases.map(({ name, testcases }, fileIndex) => (
        <SingleTestCase
          key={fileIndex}
          name={name}
          onChange={(activeCase) => {
            setActiveTestCase([fileIndex, activeCase]);
            setUpdateKey((prev) => prev + 1);
          }}
          testcases={testcases}
        />
      ))}
    </>
  );
};

export default Testcases;
