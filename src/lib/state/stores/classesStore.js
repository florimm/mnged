import { observable, computed, action } from 'mobx';

class Class {
	@observable id
	@observable color
	@observable name
	@observable room
	@observable teacher

	constructor(id, subject) {
		this.id = id;
		this.color = subject.color;
		this.name = subject.class;
		this.room = subject.room;
		this.teacher = subject.teacher;
	}
}

class Schedule {
	@observable menu = []
	@observable selectedTime = null

	constructor(menu) {
		this.menu = menu;
		this.selectedTime = new Date().getTime();
	}

	@action setEntryByDate(ms) {
		this.selectedTime = ms;
	}

	@computed get getEntryByDate() {
		let result = null;
		const ms = this.selectedTime;

		if (this.menu && ms) {
			this.menu.forEach((obj, i) => {
				const date = new Date(obj.date);
				const now = new Date(ms);
				if (date.getMonth() === now.getMonth() && date.getDate() + 1 === now.getDate()) result = obj;
			});
		}

		return result;
	}
}

export default class ClassesStore {

	@observable classes = []
	@observable schedule = null
	@observable day = 0
	@observable notes = 'loading...'
    
	@action addClass(id, subject) {
		this.classes.push(new Class(id, subject));
	}

	@action editClass(id, subjectNew) {
		for (let i = 0; i < this.classes.length; i++) {
			if (this.classes[i].id === id) this.classes[i] = new Class(id, subjectNew);
		}
	}

	@action getClassFromName(name) {
		this.classes.forEach((subject) => {
			if (subject.name === name) return subject;
		});
	}

	@action initSchedule(result) {
		this.schedule = new Schedule(result);
	}

	@action changeDisplayedClasses(ms) {
		let day = 0;
		let schedule;
		if (this.schedule) this.schedule.setEntryByDate(ms);
		if (this.schedule) schedule = this.schedule.getEntryByDate;

		let notes = 'No data provided';
		if (schedule && this.classes.length >= 9) {
			notes = schedule.notes;
			if (/^day 1/.test(notes.toLowerCase())) day = (new Date(ms).getDay() === 3) ? 3 : 1;
			if (/^day 2/.test(notes.toLowerCase())) day = (new Date(ms).getDay() === 3) ? 4 : 2;
		}

		this.day = day;
		this.notes = notes;
	}

	@computed get filteredClasses() {

		/*
			DAY 0 = schedule not loaded or no school
			DAY 1 = It's day 1
			DAY 2 = It's day 2
			DAY 3 = It's day 1, but no flex
			DAY 4 = It's day 2, but no flex
		*/
		let day = 0;
		let schedule;

		if (this.schedule) schedule = this.schedule.getEntryByDate;

		let notes = 'No data provided';
		if (schedule && this.classes.length >= 9) {
			notes = schedule.notes;
			if (/^day 1/.test(notes.toLowerCase())) day = (new Date(this.schedule.selectedTime).getDay() === 3) ? 3 : 1;
			if (/^day 2/.test(notes.toLowerCase())) day = (new Date(this.schedule.selectedTime).getDay() === 3) ? 4 : 2;
		}

		if (day === 1) return { notes, classes: [this.classes[0], this.classes[8], this.classes[1], this.classes[2], this.classes[3]] };
		if (day === 3) return { notes, classes: [this.classes[0], this.classes[1], this.classes[2], this.classes[3]] };
		if (day === 2) return { notes, classes: [this.classes[4], this.classes[8], this.classes[5], this.classes[6], this.classes[7]] };
		if (day === 4) return { notes, classes: [this.classes[4], this.classes[5], this.classes[6], this.classes[7]] };
		return { notes, classes: null };
	}
}