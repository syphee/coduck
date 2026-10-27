Here is a quick rule of thumb to remember:
• Path/Query: Public identifiers and sorting/filtering.
• Body: Large data, forms, and complex resources (creation/updates).
• Headers: Metadata (content types, tracking, API keys).
• Authorization: Proof of who you are (tokens, credentials).

1. When to use the Body

The Body is for the main payload or data you want the server to process or store. Think of it like the letter inside an envelope.
• HTTP Methods: POST, PUT, PATCH. (Never GET or DELETE).
• Use Cases:
	• Creating a new resource (e.g., submitting a registration form with a name, email, and password).
	• Updating a profile (e.g., changing your bio, profile picture link, and settings).
	• Sending large, nested JSON structures.

2. When to use Query Parameters

Query parameters appear after the ? in the URL (e.g., /products?color=blue&sort=price). They are public, visible, and part of the web address.
• HTTP Methods: Primarily GET.
• Use Cases:
	• Filtering: Narrowing down a list (e.g., ?category=shoes).
	• Sorting: Changing the order of data (e.g., ?order=desc).
	• Pagination: Moving through pages of data (e.g., ?page=2&limit=20).
	• Search: Passing a search keyword (e.g., ?q=javascript).

3. When to use Headers

Headers provide metadata about the request or the client. They describe how the data should be handled, rather than containing the data itself. Think of them like the stamps or routing marks on the outside of an envelope.
• HTTP Methods: All methods (GET, POST, PUT, DELETE, etc.).
• Use Cases:
	• Telling the server what format you are sending/expecting (e.g., Content-Type: application/json).
	• Passing custom tracking IDs for debugging (e.g., X-Request-ID).
	• Anti-tampering secrets (like the X-Telegram-Bot-Api-Secret-Token your grammY bot relies on).

4. When to use Authorization (A Specific Header)

The Authorization header is a highly specific, standardized type of header used exclusively to prove your identity to the server.
• HTTP Methods: All methods.
• Use Cases:
	• Passing a login token after a user signs in (e.g., Authorization: Bearer <your_jwt_token>).
	• Passing basic username/password credentials (e.g., Authorization: Basic <encoded_credentials>).

Cheatsheet Table


Where	Example	Best Used For	Visible in URL?	Safe for Passwords/Tokens?
Path Parameter	/users/123	Locating a specific resource by ID	Yes	❌ No
Query Parameter	?page=2&sort=name	Filtering, sorting, searching lists	Yes	❌ No
Body	{"username": "alex"}	Creating/updating resources, large objects	No	Yes
Headers	Content-Type: json	Configuration, metadata, API secrets	No	Yes
Authorization	Bearer xyz123...	User login tokens, session validation	No	Yes
