class Buffer {
  constructor() {
    this.value = '';
    this.indentation = 0;
  }

  get whitespace() {
    return new Array(this.indentation + 1).join('  ');
  }

  indent() {
    this.indentation++;
  }

  dedent() {
    this.indentation--;
  }

  newline() {
    this.value += '\n';
  }

  append(value) {
    this.value += this.whitespace + value + '\n';
  }

  appendf(strings, ...values) {
    const sanitize = (value = '') =>
      value.replace(/[\(\)]/g, '').replace(/-/g, '_');

    const value = strings
      .map((str, i) => {
        const sanitized = sanitize(values[i]);
        return sanitized ? str + sanitized : sanitized
      })
      .join('');

    this.append(value);
  }
}

module.exports = Buffer;
