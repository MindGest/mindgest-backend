import * as crypto from 'crypto'

export function hashString(string:string){
  crypto.createHash('md5').update(string).digest('hex')
}