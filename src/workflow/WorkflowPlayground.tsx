import { useEffect, useMemo, useState, useRef } from 'react';
import { ObjectCloner, Step, StepsConfiguration, ToolboxConfiguration, ValidatorConfiguration } from 'sequential-workflow-designer';
import { SequentialWorkflowDesigner, wrapDefinition } from 'sequential-workflow-designer-react';
import { createWriteStep, createIfStep, createParallelStep, rootEditorProvider, stepEditorProvider } from './StepUtils';
import { useSequentialWorkflowDesignerController } from 'sequential-workflow-designer-react';
import { WorkflowDefinition } from './model';
import React from 'react';

const startDefinition: WorkflowDefinition = {
    properties: {
    },
    sequence: [ 
        createIfStep('If', [createWriteStep('header')],[]), 
        createParallelStep('Parallel', [createWriteStep('null'), createWriteStep('checksum'), createWriteStep('buffer')]) ]
};
export function Playground() {
    const controller = useSequentialWorkflowDesignerController();
    const toolboxConfiguration: ToolboxConfiguration = useMemo(() => ({
        groups: [{ 
            name: 'Steps', 
            steps: [createWriteStep(''), createIfStep('If', [], []), createParallelStep('Parallel', [])] }]
    }), []
    );
    const stepsConfiguration: StepsConfiguration = useMemo(() => ({
        iconUrlProvider: (componentType: any) => {
            return null;
        } 
    }), []);
    const validatorConfiguration: ValidatorConfiguration = useMemo(
        () => ({
            step: (step: Step) => Boolean(step.name),
            root: (definition: WorkflowDefinition) => Boolean(definition.properties)
        }),
        []
    );

    const [isVisible, setIsVisible] = useState(true);
    const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [definition, setDefinition] = useState(() => wrapDefinition(startDefinition));
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [isReadonly, setIsReadonly] = useState(false);
    const [moveViewportToStep, setMoveViewportToStep] = useState<string | null>(null);
    const definitionJson = JSON.stringify(definition.value, null, 2);

    useEffect(() => {
        console.log(`definition updated, isValid=${definition.isValid}`);
    }, [definition]);

    useEffect(() => {
        if (moveViewportToStep) {
            if (controller.isReady()) {
                controller.moveViewportToStep(moveViewportToStep);
            }
            setMoveViewportToStep(null);
        }
    }, [controller, moveViewportToStep]);

    return (
        <>
            {isVisible && (
                <SequentialWorkflowDesigner
                    undoStackSize={25}
                    definition={definition}
                    onDefinitionChange={setDefinition}
                    selectedStepId={selectedStepId}
                    isReadonly={isReadonly}
                    onSelectedStepIdChanged={setSelectedStepId}
                    toolboxConfiguration={toolboxConfiguration}
                    isToolboxCollapsed={isToolboxCollapsed}
                    onIsToolboxCollapsedChanged={setIsToolboxCollapsed}
                    stepsConfiguration={stepsConfiguration}
                    validatorConfiguration={validatorConfiguration}
                    controlBar={true}
                    rootEditor={rootEditorProvider}
                    stepEditor={stepEditorProvider}
                    isEditorCollapsed={isEditorCollapsed}
                    onIsEditorCollapsedChanged={setIsEditorCollapsed}
                    controller={controller}
                />
                
            )
            }
        </>
    );

}