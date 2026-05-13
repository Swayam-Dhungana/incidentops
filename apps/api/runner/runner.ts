import fs from 'fs/promises'
import sql from '../db.config';
import path from 'path';
// here direct access failed because ../db/migrations/001_initial_setup.sql runs from the current working dir of the bun not where the script is placed so we replaced it with the updated path config which now makes sense for the provided path 


const migrationsPath=path.join(import.meta.dirname, "../../../db/migrations/002_primary_key.sql") //Relative paths are not always relative to the file.

const migration=await fs.readFile(migrationsPath,'utf-8');
try{
    await sql.unsafe(migration); //unsafe is used in order to tell postgress that this is a trusted raw sql run it as it is without any parsing/parameterization it is not safe if we pass the user input as unsafe cause user will have access such as drops
    console.log('Migrations applied successfully! ');
}catch(err){
    console.log('Failed to apply migrations: ', err);
}finally{
    console.log('Breaking the connection');
}
