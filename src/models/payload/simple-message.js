export default class SimpleMessage {
  constructor(
      subject = "PU KALTENG",
      to= "", //Nomor Whatsapp
      message = ""

  ) {
    this.subject = subject;
    this.to = to;
    this.message = message;
  }

}
