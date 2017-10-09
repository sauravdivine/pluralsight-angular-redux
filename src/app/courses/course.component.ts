import { Component, OnInit, Input, AfterContentChecked } from '@angular/core';
import { CourseService } from './course.service';
import { Course } from './course';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../blocks/toast';
import { ModalService } from '../blocks/modal';

var XRegExp = require('xregexp');

@Component({
  templateUrl: './course.component.html',
})
export class CourseComponent implements OnInit, AfterContentChecked {
  @Input() course: Course;
  editCourse: Course = <Course>{};

  constructor(
    private _courseService: CourseService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _toastService: ToastService,
    private _modalService: ModalService
  ) { }

  private _getCourse() {

    let id = +this._route.snapshot.params['id'];
    if (id === 0) return;
    if (this.isAddMode()) {
      this.course = <Course>{ name: '', topic: 'Web' };
      this.editCourse = this.course;
      return;
    }
    this._courseService.getCourse(id)
      .subscribe(course => this._setEditCourse(course));
  }

  private _setEditCourse(course: Course) {
    if (course) {
      this.course = course;
      this.editCourse = Object.assign({}, this.course);
    } else {
      this._gotoCourses();
    }
  }

  cancel(showToast = true) {
    this.editCourse = Object.assign({}, this.course);
    if (showToast) {
      this._toastService.activate(`Cancelled changes to ${this.course.name}`);
    }

    this._router.navigate(['courses']);
  }

  isAddMode() {
    const id = +this._route.snapshot.params['id'];
    return isNaN(id);
  }

  save() {
    let course = this.course;
    if (course.id == null) {
      this._courseService.addCourse(this.editCourse)
        .subscribe(char => {
          this._setEditCourse(char);
          this._toastService.activate(`Successfully added ${char.name}`);
          this._gotoCourses();
        });
      return;
    }
    this._courseService.updateCourse(this.editCourse)
      .subscribe(() => {
        this._toastService.activate(`Successfully saved ${course.name}`);
        this._gotoCourses();
      });
  }

  delete() {
    let msg = `Do you want to delete ${this.course.name}?`;
    this._modalService.activate(msg).then(responseOK => {
      if (responseOK) {
        this.cancel(false);
        this._courseService.deleteCourse(this.course)
          .subscribe(() => {
            this._toastService.activate(`Deleted ${this.course.name}`);
            this._gotoCourses();
          });
      }
    });
  }

  private _gotoCourses() {
    this._router.navigate(['courses']);
  }


  ngOnInit() {
    // console.log("toJavaIdentifier('1input 1')  => " + toJavaIdentifier('#input')); // returns true
    console.log("isValidJavaIdentifier('#input')  => " + isValidJavaIdentifier('1absc'));
    this._getCourse();

  }

  ngAfterContentChecked() {
    componentHandler.upgradeDom();
  }

}

function isValidJavaIdentifier(word) {
  // let identifierRegEx = XRegExp(/([a-z,A-Z,_]|(\\p{chinese}))[a-z,A-Z,_,0-9]|(\\p{chinese})*/);  

  let identifierRegEx = new RegExp(/([a-zA-Z$_]|[^\u0000-\u007F\uD800-\uDBFF]|[\uD800-\uDBFF] [\uDC00-\uDFFF])([a-zA-Z0-9$_]|[^\u0000-\u007F\uD800-\uDBFF]|[\uD800-\uDBFF] [\uDC00-\uDFFF])*/);
  //let identifierRegEx = XRegExp('^(\\pL|_|$)(\\pL|[0-9]|_|$)*$');
  var match = word.match(identifierRegEx);
  return match ? match[0] === word : false;
};

function isJavaKeyword(word) {
  var keywords = [
    'abstract', 'continue', 'for', 'new', 'switch',
    'assert', 'default', 'if', 'package', 'synchronized',
    'boolean', 'do', 'goto', 'private', 'this',
    'break', 'double', 'implements', 'protected', 'throw',
    'byte', 'else', 'import', 'public', 'throws',
    'case', 'enum', 'instanceof', 'return', 'transient',
    'catch', 'extends', 'int', 'short', 'try',
    'char', 'final', 'interface', 'static', 'void',
    'class', 'finally', 'long', 'strictfp', 'volatile',
    'const', 'float', 'native', 'super', 'while',
    'true', 'false', 'null'
  ];

  if (word && keywords.indexOf(word) < 0) {
    return false;
  }
  return true;
}

function isJavaIdentifierStart(ch: string): boolean {
  var identifierStartRegEx = new RegExp(/[a-z,A-Z,_,$]/);
  return identifierStartRegEx.test(ch);
}

function isJavaIdentifierPart(ch: any): boolean {
  var identifierStartRegEx = new RegExp(/[a-z,A-Z,_,$,0-9]/);
  return identifierStartRegEx.test(ch);
}

function toJavaIdentifier(name: string): string {
  if (name == null || name.length === 0 || isJavaKeyword(name)) {
    return "input";
  }
  else if (!isValidJavaIdentifier(name)) {
    let validName: string = "";
    let len = name.length;
    let firstChar = name.charAt(0);
    validName = validName.concat(isJavaIdentifierStart(firstChar) ? firstChar : '_');
    for (let idx = 1; idx < len; idx++) {
      let ch = name.charAt(idx);
      validName = validName.concat(isJavaIdentifierPart(ch) ? ch : '_');
    }
    return validName;
  }
  else {
    return name;
  }

}