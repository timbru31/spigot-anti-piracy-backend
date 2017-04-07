package your.package;

public class BlacklistedException extends Exception {
    public BlacklistedException() {
        super();
    }

    public BlacklistedException(String message) {
        super(message);
    }

    public BlacklistedException(String message, Throwable cause) {
        super(message, cause);
    }

    public BlacklistedException(Throwable cause) {
        super(cause);
    }
}
