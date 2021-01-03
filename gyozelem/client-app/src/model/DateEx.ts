export class DateEx extends Date {

    public toMySQLDate = (): string => {
        return `${this.getFullYear()}-${(""+(this.getMonth() + 1)).padStart(2, '0')}-${(""+this.getDate()).padStart(2, '0')} ${(""+this.getHours()).padStart(2, '0')}:${(""+this.getMinutes()).padStart(2, '0')}:${(""+this.getSeconds()).padStart(2, '0')}`;
    }
    

    public isBefore = (target: DateEx) => {
        if (typeof target === 'string') { target = new DateEx(target); }
        return this.getTime() < target.getTime();
    }

    public isAfter = (target: DateEx) => {
        if (typeof target === 'string') { target = new DateEx(target); }
        return this.getTime() > target.getTime();
    }

    public clone = () => {
        return new DateEx(this.getTime());
    }

    public getObjectForm = () => {
         return {
            day: this.getDate(),
            month: this.getMonth() + 1,
            year: this.getFullYear(),
            hour: this.getHours(),
            min: this.getMinutes(),
            sec: this.getSeconds()
        }
    }

    public add = (modifier: Partial<Record<'year' | 'month' | 'day' | 'hour' | 'min' | 'sec', number>>): DateEx => {
        const { 
            year, 
            month, 
            day,
            hour,
            min,
            sec 
        } = modifier;
        if (day) this.setSeconds(this.getSeconds() + sec);
        if (min) this.setMinutes(this.getMinutes() + min);
        if (hour) this.setHours(this.getHours() + hour);
        if (day) this.setDate(this.getDate() + day);
        if (month) this.setMonth(this.getMonth() + month - 1);
        if (year) this.setFullYear(this.getFullYear() + year);
        return this;
    }

    public substract = (modifier: Partial<Record<'year' | 'month' | 'day' | 'hour' | 'min' | 'sec', number>>): DateEx => {
        const { 
            year, 
            month, 
            day,
            hour,
            min,
            sec 
        } = modifier;
        if (day) this.setSeconds(this.getSeconds() - sec);
        if (min) this.setMinutes(this.getMinutes() - min);
        if (hour) this.setHours(this.getHours() - hour);
        if (day) this.setDate(this.getDate() - day);
        if (month) this.setMonth(this.getMonth() - month - 1);
        if (year) this.setFullYear(this.getFullYear() - year);
        return this;
    }
    
    public set = (modifier: Partial<Record<'year' | 'month' | 'day' | 'hour' | 'min' | 'sec', number>>): DateEx => {
        const { 
            year, 
            month, 
            day,
            hour,
            min,
            sec 
        } = modifier;
        if (day) this.setSeconds(sec);
        if (min) this.setMinutes(min);
        if (hour) this.setHours(hour);
        if (day) this.setDate(day);
        if (month) this.setMonth(month - 1);
        if (year) this.setFullYear(year);
        return this;
    }
}