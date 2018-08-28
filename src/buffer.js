class Buffer {
  constructor() {
    this.value = '';
    this.indentation = 0;
  }

  indent() {
    this.indentation++;
  }

  outdent() {
    this.indentation--;
  }

  whitespace() {
    return new Array(this.indentation + 1).join('  ');
  }

  newline() {
    this.value += '\n';
  }

  append(value) {
    this.value += this.whitespace() + value + '\n';
  }

  appendf(strings, ...values) {
    const fn = (str, value) =>
      str + value.replace(/[\(\)]/g, '').replace(/-/g, '_');

    const value = strings
      .map((str, i) => fn(str, values[i] || ''))
      .join('');

    this.append(value);
  }
}

module.exports = Buffer;
