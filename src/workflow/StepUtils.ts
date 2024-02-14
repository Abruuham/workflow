import { Uid } from 'sequential-workflow-designer';
import { SwitchStep, TaskStep } from './model';

export function randomCondition(){
	const a = Math.random() > 0.5 ? 'alfa' : 'beta';
	const b = Math.random() > 0.5 ? '>' : '<';
	const c = Math.round(Math.random() * 100);

	return `${a} ${b} ${c}`;
}


export function createWriteStep(value: any){
	return{ 
		id: Uid.next(),
		componentType: 'task',
		type: 'write',
		name: `Write ${value}`,
		properties: {}
	}
}

export function createIfStep(name: string, trueSteps: any, falseSteps: any){
	return {
		id: Uid.next(),
		componentType: 'switch',
		type: 'if',
		name,
		properties: {
			condition: randomCondition()
		},
		branches: {
			true: trueSteps || [],
			false: falseSteps || []
		}
	}
}

export function createParallelStep(name: string, children: any[]) {
	return {
		id: Uid.next(),
		componentType: 'switch',
		type: 'parallel',
		name,
		properties: {
			conditions: {
				'Condition A': randomCondition(),
				'Condition B': randomCondition(),
				'Condition C': randomCondition()
			}
		},
		branches: {
			'Condition A': children  ? [children[0]] : [],
			'Condition B': children  ? [children[1]] : [],
			'Condition C': children  ? [children[2]] : []
		}
	};
}

export function createButton(text: string, clickHandler: any) {
	const button = document.createElement('button');
	button.innerText = text;
	button.addEventListener('click', clickHandler, false);
	return button;
}

export function appendTitle(root: any, title: string) {
	const h2 = document.createElement('h2');
	h2.innerText = title;
	root.appendChild(h2);
}

export function appendPropertyTitle(root: any, title: string) {
	const h3 = document.createElement('h3');
	h3.innerText = title;
	root.appendChild(h3);
}

export function appendNameEditor(root: any, step: any, editorContext: any) {
	const input = document.createElement('input');
	input.type = 'text';
	input.value = step.name;
	input.addEventListener(
		'input',
		() => {
			step.name = input.value;
			editorContext.notifyNameChanged();
		},
		false
	);

	appendPropertyTitle(root, 'Name');
	root.appendChild(input);
}

export function appendConditionEditor(root: any, value: any, onChange: any) {
	const input = document.createElement('input');
	input.type = 'text';
	input.value = value;
	input.addEventListener(
		'input',
		() => {
			onChange(input.value);
		},
		false
	);
	root.appendChild(input);
}

export function ifStepEditorProvider(step: any, editorContext: any) {
	const root = document.createElement('div');
	appendTitle(root, 'If step');
	appendNameEditor(root, step, editorContext);
	appendPropertyTitle(root, 'Condition');
	appendConditionEditor(root, step.properties.condition, (value: any) => {
		step.properties.condition = value;
		editorContext.notifyPropertiesChanged();
	});
	return root;
}

export function parallelStepEditorProvider(step: any, editorContext: any) {
	function deleteBranch(branch: any, name: any) {
		root.removeChild(branch);
		delete step.branches[name];
		editorContext.notifyChildrenChanged();
	}

	function appendBranch(name: any) {
		const branch = document.createElement('div');
		branch.className = 'switch-branch';

		const title = document.createElement('h4');
		title.innerText = name;

		const label = document.createElement('label');
		label.innerText = 'Condition: ';

		branch.appendChild(title);
		branch.appendChild(label);

		appendConditionEditor(branch, step.properties.conditions[name], (value: any) => {
			step.properties.conditions[name] = value;
			editorContext.notifyPropertiesChanged();
		});

		const deleteButton = createButton('Delete branch', () => {
			if (Object.keys(step.branches).length <= 1) {
				window.alert('You cannot delete the last branch.');
				return;
			}
			if (!window.confirm('Are you sure?')) {
				return;
			}
			deleteBranch(branch, name);
		});
		branch.appendChild(deleteButton);
		root.appendChild(branch);
	}

	function addBranch(name: any) {
		step.properties.conditions[name] = randomCondition();
		step.branches[name] = [];
		editorContext.notifyChildrenChanged();
		appendBranch(name);
	}

	const root = document.createElement('div');
	appendTitle(root, 'Parallel step');
	appendNameEditor(root, step, editorContext);

	const addBranchButton = createButton('Add branch', () => {
		const branchName = window.prompt('Enter branch name');
		if (branchName) {
			addBranch(branchName);
		}
	});

	appendPropertyTitle(root, 'Branches');
	root.appendChild(addBranchButton);
	for (const initialBranchName of Object.keys(step.branches)) {
		appendBranch(initialBranchName);
	}
	return root;
}

function writeStepEditorProvider(step: any, editorContext: any) {
	const root = document.createElement('div');
	appendTitle(root, `${step.type} step`);
	appendNameEditor(root, step, editorContext);
	return root;
}

export function rootEditorProvider() {
	const root = document.createElement('div');
	appendTitle(root, `Multi-Conditional Switch`);
	const description = document.createElement('p');
	description.innerText = 'This example demonstrates how to create a multi-conditional switch step.';
	root.appendChild(description);
	return root;
}

export function stepEditorProvider(step: any, editorContext: any) {
	switch (step.type) {
		case 'if':
			return ifStepEditorProvider(step, editorContext);
		case 'parallel':
			return parallelStepEditorProvider(step, editorContext);
		case 'write':
			return writeStepEditorProvider(step, editorContext);
	}
	throw new Error('Unknown step type');
}

function load() {
	const definition = {
		sequence: [
			createIfStep('If', [createWriteStep('header')], []),
			createParallelStep('Parallel', [createWriteStep('null'), createWriteStep('checksum'), createWriteStep('buffer')])
		],
		properties: {}
	};
	const configuration = {
		toolbox: {
			groups: [
				{
					name: 'Steps',
					steps: [createWriteStep('_'), createIfStep('If', [], []), createParallelStep('Parallel', [])]
				}
			]
		},
		steps: {
			iconUrlProvider: (componentType: any) => {
				return componentType === 'switch' ? './assets/icon-if.svg' : './assets/icon-task.svg';
			}
		},
		editors: {
			rootEditorProvider,
			stepEditorProvider
		},
		controlBar: true
	};
}

