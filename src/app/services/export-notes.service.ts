import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import slugify from 'slugify';
import { saveAs } from 'file-saver';
import { Note } from "../models/note";


@Injectable({
  providedIn: 'root'
})
export class ExportNotesService {

  constructor() { }

  getZip(notes: Note[]) {
    const zip = new JSZip();

    const now     = new Date,
      nowYear     = now.getFullYear(),
      nowMonth    = this.pad(now.getMonth() + 1),
      nowDate     = this.pad(now.getDate()),
      nowHours    = this.pad(now.getHours()),
      nowMinutes  = this.pad(now.getMinutes());

    const baseDirname = `naute-notes_${nowYear}-${nowMonth}-${nowDate}_${nowHours}h${nowMinutes}`;


    notes.forEach(note => {
      const dateObject = new Date(note.createdAt),
        year      = dateObject.getFullYear(),
        month     = this.pad(dateObject.getMonth() + 1),
        date      = this.pad(dateObject.getDate()),
        hours     = this.pad(dateObject.getHours()),
        minutes   = this.pad(dateObject.getMinutes()),
        title     = this.getTitle(note);

      const frontMatter =
          '---\n'
        + (title ? `title: ${title}\n` : '')
        + `date: ${dateObject.toISOString()}\n`
        + '---\n\n';

      const filename  = `${baseDirname}/${year}/${month}/${year}-${month}-${date}_${hours}h${minutes}${title ? '__' + title : ''}.md`
      const content = frontMatter + note.content;

      zip.file(filename, content);
    });


    const zipFilename = `${baseDirname}.zip`;

    zip.generateAsync({type:"blob"})
      .then( blob => {
        saveAs(blob, zipFilename);
      }, err => {
        console.log(err);
      });
  }

  getTitle(note: Note): string {
    let title = '';

    const titleMatch = note.content.match(/^# (?<title>.*)(?:\n|$)/);

    if (titleMatch && titleMatch.groups && titleMatch?.groups['title']) {
      title = slugify(titleMatch?.groups['title'], {locale: 'fr'}); // TODO: dynamically use the current locale
    }

    return title;
  }

  pad(n: number): string {
    return (n < 10 ? `0${n}` : `${n}`);
  }
}
