[Implement JWTS for other platforms support]
Files involved:
zzz



[Fix user tele accounts not linking with Notion]

Files involved:
authController-registerUserToNotion


[implement stateless architecture for linking active user-notion sources]
Files involved:

[ DONE]
authController - UPSERT
authAPI - endpoint for ^
vercel.json - register as valid endpoint
neondb - test constraints and upserts


[WIP]
implement using selected active source into endpoints, replacing hard coded .env
to add jwts and encryption for this
